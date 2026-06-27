import json
import math
import re
from collections import Counter
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = Path(
    r"C:\Users\Ning Sun\Documents\Codex\2026-06-27\implement-this-ui-in-the-current-6\outputs\天泰产品分类表_熔敷金属表格重提取_去空牌号_药芯气保分类版.xlsx"
)
PRODUCTS_PATH = ROOT / "data" / "jinqiao-products.json"
REPORT_PATH = ROOT / "docs" / "tiantai-import-report.md"

MANUFACTURER = "天泰"
SOURCE_NAME = "天泰产品分类表_熔敷金属表格重提取_去空牌号_药芯气保分类版.xlsx"

CATEGORY_NAMES = {
    "carbon-steel-electrodes": "碳钢焊条",
    "solid-wires": "实芯气保及氩弧焊丝",
    "flux-cored-wires": "药芯气保焊丝",
    "stainless-materials": "不锈钢焊材",
    "submerged-arc": "碳钢埋弧焊丝焊剂",
    "aluminum-wires": "铝焊丝",
    "special-materials": "特种焊材",
}

CHEMISTRY_COLUMNS = [
    ("C", "化学C"),
    ("Mn", "化学Mn"),
    ("Si", "化学Si"),
    ("P", "化学P"),
    ("S", "化学S"),
    ("Cu", "化学Cu"),
    ("Ni", "化学Ni"),
    ("Cr", "化学Cr"),
    ("Mo", "化学Mo"),
    ("V", "化学V"),
    ("Nb", "化学Nb"),
    ("Al", "化学Al"),
    ("Ti", "化学Ti"),
    ("B", "化学B"),
    ("W", "化学W"),
    ("Co", "化学Co"),
    ("N", "化学N"),
]

MECHANICAL_COLUMNS = [
    ("屈服强度", "机械屈服强度MPa", "MPa"),
    ("抗拉强度", "机械抗拉强度MPa", "MPa"),
    ("延伸率", "机械延伸率%", "%"),
    ("冲击值", "机械冲击值", ""),
    ("PWHT", "PWHT", ""),
]


def clean_text(value):
    if is_blank(value):
        return ""
    text = str(value)
    replacements = {
        "\u3000": " ",
        "\r\n": "\n",
        "\r": "\n",
        "℃": "°C",
        "（": "(",
        "）": ")",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    lines = []
    for line in text.split("\n"):
        line = " ".join(line.split())
        if line:
            lines.append(line)
    return "\n".join(lines).strip()


def clean_inline(value):
    return " ".join(clean_text(value).split())


def is_blank(value):
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    text = str(value).strip()
    return text == "" or text.lower() == "nan"


def normalize_model(model):
    model = clean_inline(model)
    return model.replace("（", "(").replace("）", ")")


def slugify_model(model):
    slug = model.lower()
    slug = slug.replace("φ", "phi").replace("Φ", "phi")
    slug = re.sub(r"[\s/\\()（）]+", "-", slug)
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or "unknown"


def split_standards(*values):
    standards = []
    for value in values:
        text = clean_text(value)
        if not text:
            continue
        for part in re.split(r"[\n;；]+", text):
            item = clean_inline(part)
            if not item:
                continue
            item = item.replace("GB/T5117", "GB/T 5117")
            item = item.replace("AWSA", "AWS A")
            item = item.replace("ENISO", "EN ISO")
            item = re.sub(r"\s+", " ", item).strip(" /,，")
            if item and item not in standards:
                standards.append(item)
    if any(item.startswith("NB/T") for item in standards) and "NB/T 47018 承压产品" not in standards:
        standards.append("NB/T 47018 承压产品")
    return standards


def category_for(row):
    group = clean_inline(row.get("上方分类"))
    product_type = clean_inline(row.get("类型"))
    name = clean_inline(row.get("产品命名"))
    combined = f"{group} {product_type} {name}"

    if "铝" in combined:
        return "aluminum-wires"
    if "不锈钢" in combined:
        return "stainless-materials"
    if "埋弧" in combined and "碳钢" in combined:
        return "submerged-arc"
    if "埋弧" in combined:
        return "special-materials"
    if "药芯" in combined:
        if "碳钢及高强钢" in combined or product_type == "药芯气保焊丝":
            return "flux-cored-wires"
        return "special-materials"
    if (
        "气保焊丝" in combined
        or "氩弧焊丝" in combined
        or "实心" in combined
        or "金属粉型焊丝" in combined
        or ("焊丝" in combined and "碳钢及高强钢" in combined)
    ):
        if "碳钢及高强钢" in combined:
            return "solid-wires"
        return "special-materials"
    if "碳钢及高强钢" in combined and "手焊条" in combined:
        return "carbon-steel-electrodes"
    if product_type == "碳钢及高强钢焊材":
        return "carbon-steel-electrodes"
    return "special-materials"


def safe_number_text(value, unit="", element=None, mechanical=None, anomalies=None, model=None):
    if is_blank(value):
        return ""
    text = clean_inline(value)
    if not text:
        return ""
    text = text.replace("°°C", "°C").replace("℃", "°C")

    # Excel OCR can occasionally produce values such as 0E9 or 6000 in chemical
    # columns. Keep uncertain values out of product details and log them.
    if re.search(r"\d+E\d+", text, re.I):
        if anomalies is not None:
            anomalies.append(f"{model} {element or mechanical or 'value'}={text}")
        return ""
    try:
        number = float(text)
        if element and (number > 5 or number < 0):
            if anomalies is not None:
                anomalies.append(f"{model} {element}={text}")
            return ""
        if element in {"P", "S"} and number > 0.1:
            if anomalies is not None:
                anomalies.append(f"{model} {element}={text}")
            return ""
        if mechanical in {"屈服强度", "抗拉强度"} and number < 100:
            if anomalies is not None:
                anomalies.append(f"{model} {mechanical}={text}")
            return ""
        if mechanical == "延伸率" and not (0 <= number <= 100):
            if anomalies is not None:
                anomalies.append(f"{model} {mechanical}={text}")
            return ""
        text = f"{number:g}"
    except ValueError:
        if element and re.search(r"\b\d{3,}\b", text):
            if anomalies is not None:
                anomalies.append(f"{model} {element}={text}")
            return ""
    return f"{text}{unit}" if unit and not text.endswith(unit) else text


def build_composition(row, model, anomalies):
    rows = []
    for name, column in CHEMISTRY_COLUMNS:
        value = safe_number_text(row.get(column), element=name, anomalies=anomalies, model=model)
        if value:
            rows.append({"name": name, "value": value})
    return rows


def build_deposited_metal(row, model, anomalies):
    rows = []
    for name, column, unit in MECHANICAL_COLUMNS:
        value = safe_number_text(row.get(column), unit=unit, mechanical=name, anomalies=anomalies, model=model)
        if value:
            rows.append({"name": name, "value": value})
    return rows


def fallback_summary(model, category_name, intro, applications):
    source = clean_inline(intro) or clean_inline(applications)
    if source:
        first = re.split(r"[。！？.!?]", source)[0].strip()
        if first:
            return f"天泰 {model}，{category_name}。{first}。"
    return f"天泰 {model}，{category_name}，适用于相应母材、强度等级和焊接工况的项目选型。"


def build_products():
    frame = pd.read_excel(EXCEL_PATH, sheet_name=0)
    products = []
    skipped = []
    anomalies = []

    for source_row, raw in frame.iterrows():
        row = raw.to_dict()
        if clean_inline(row.get("品牌")) != MANUFACTURER:
            continue
        model = normalize_model(row.get("牌号"))
        if not model:
            skipped.append(int(source_row) + 2)
            continue

        category_slug = category_for(row)
        category_name = CATEGORY_NAMES[category_slug]
        product_name = clean_inline(row.get("产品命名"))
        introduction = clean_text(row.get("特性"))
        applications = clean_text(row.get("应用场景"))
        standards = split_standards(row.get("国标"), row.get("美标"), row.get("国际标准"))
        page = clean_inline(row.get("页码"))
        position = clean_inline(row.get("位置"))
        source = SOURCE_NAME
        if page:
            source += f"；页码：{page}"
        if position:
            source += f"；位置：{position}"

        product = {
            "slug": f"tiantai-{slugify_model(model)}",
            "manufacturer": MANUFACTURER,
            "categorySlug": category_slug,
            "categoryName": category_name,
            "model": model,
            "name": product_name or f"天泰 {model} {category_name}",
            "standard": " / ".join(standards),
            "standards": standards,
            "summary": fallback_summary(model, category_name, introduction, applications),
            "introduction": introduction,
            "applications": [applications] if applications else [],
            "composition": build_composition(row, model, anomalies),
            "depositedMetal": build_deposited_metal(row, model, anomalies),
            "dimensions": [],
            "certifications": [],
            "notes": "以天泰最新产品手册、质保书及项目技术条件为准；关键工程请结合 WPS/PQR 复核。",
            "source": source,
            "_sourceRow": int(source_row) + 2,
        }
        products.append(product)

    deduped = {}
    duplicates = []
    for product in products:
        slug = product["slug"]
        if slug not in deduped:
            deduped[slug] = product
            continue
        duplicates.append((slug, deduped[slug]["_sourceRow"], product["_sourceRow"]))
        if data_score(product) > data_score(deduped[slug]):
            deduped[slug] = product

    result = []
    for product in deduped.values():
        product.pop("_sourceRow", None)
        result.append(product)
    result.sort(key=lambda item: (item["categorySlug"], item["model"]))
    return result, skipped, duplicates, anomalies


def data_score(product):
    return sum(
        [
            len(product.get("standards") or []),
            len(product.get("introduction") or ""),
            len(product.get("applications") or []),
            len(product.get("composition") or []),
            len(product.get("depositedMetal") or []),
        ]
    )


def main():
    tiantai_products, skipped, duplicates, anomalies = build_products()
    existing = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8-sig"))
    retained = [item for item in existing if item.get("manufacturer") != MANUFACTURER]
    merged = retained + tiantai_products
    PRODUCTS_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    category_counts = Counter(item["categoryName"] for item in tiantai_products)
    missing = {
        "介绍": sum(not item.get("introduction") for item in tiantai_products),
        "适用场景": sum(not item.get("applications") for item in tiantai_products),
        "执行标准": sum(not item.get("standards") for item in tiantai_products),
        "成分": sum(not item.get("composition") for item in tiantai_products),
        "熔敷金属": sum(not item.get("depositedMetal") for item in tiantai_products),
    }

    report = [
        "# 天泰产品导入报告",
        "",
        f"- 来源文件：`{EXCEL_PATH}`",
        f"- 导入厂家：{MANUFACTURER}",
        f"- 导入产品：{len(tiantai_products)} 个",
        f"- 跳过空牌号行：{len(skipped)}",
        f"- 重复 slug 合并：{len(duplicates)} 组",
        "",
        "## 分类数量",
        "",
    ]
    for name, count in sorted(category_counts.items()):
        report.append(f"- {name}: {count}")
    report.extend(["", "## 缺失字段统计", ""])
    for name, count in missing.items():
        report.append(f"- {name}: {count}")
    report.extend(["", "## 数据清洗说明", ""])
    report.append("- 成分优先使用表格中 `化学C` 至 `化学N` 的结构化列。")
    report.append("- 熔敷金属优先使用 `屈服强度 / 抗拉强度 / 延伸率 / 冲击值 / PWHT` 结构化列。")
    report.append("- 发现明显 OCR 异常的化学成分值会跳过，并记录在下方。")
    if anomalies:
        report.extend(["", "## 跳过的疑似 OCR 异常值", ""])
        for item in anomalies[:120]:
            report.append(f"- {item}")
        if len(anomalies) > 120:
            report.append(f"- 其余 {len(anomalies) - 120} 条略。")
    if duplicates:
        report.extend(["", "## 重复合并记录", ""])
        for slug, first_row, duplicate_row in duplicates[:80]:
            report.append(f"- `{slug}`: 来源行 {first_row} / {duplicate_row}")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "imported": len(tiantai_products),
                "categoryCounts": dict(category_counts),
                "missing": missing,
                "duplicates": len(duplicates),
                "anomalies": len(anomalies),
            },
            ensure_ascii=True,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
