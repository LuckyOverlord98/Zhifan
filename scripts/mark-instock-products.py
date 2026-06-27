import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = Path(r"C:\Users\Ning Sun\Desktop\匹配产品.xlsx")
PRODUCTS_PATH = ROOT / "data" / "jinqiao-products.json"
REPORT_PATH = ROOT / "docs" / "instock-products-report.md"

MANUFACTURERS = {"金桥", "上海东风", "大西洋", "天泰"}
SOURCE_LABEL = "匹配产品.xlsx"

MODEL_PATTERNS = [
    r"SH\s*[A-Z]?\s*\d+[A-Z0-9-]*(?:\s*\d+)?",
    r"SH\s*[A-Z]+[A-Z0-9-]*",
    r"(?:TWE|TIG|TM|TL|TR|TF|TS|TEC|TAC)-?[A-Z0-9]+(?:-[A-Z0-9]+)*(?:\([A-Z0-9-]+\))?",
    r"(?:CHE|CHT|CHW|CHF|CHG)[A-Z0-9-]*",
    r"JQ[.\-]?[A-Z0-9]+(?:[.\-][A-Z0-9]+)*",
    r"(?:J|A|R|D|G|Z)\d{2,4}[A-Z0-9-]*",
    r"H\d{2}[A-Z][A-Z0-9-]*",
    r"SJ\d{3}[A-Z0-9-]*",
]


def clean_text(value):
    if value is None:
        return ""
    if isinstance(value, float) and pd.isna(value):
        return ""
    return " ".join(str(value).replace("\u3000", " ").replace("（", "(").replace("）", ")").split())


def normalize(value):
    text = unicodedata.normalize("NFKC", clean_text(value)).upper()
    text = text.replace("Ф", "Φ")
    text = re.sub(r"简装|整箱|箱装|盘装|桶装|公斤|KG", "", text)
    text = re.sub(r"Φ\s*\d+(?:\.\d+)?", "", text)
    return re.sub(r"[^A-Z0-9]+", "", text)


def model_candidates(type_or_name, explicit_model):
    candidates = []
    for value in [explicit_model, type_or_name]:
        text = clean_text(value)
        if not text:
            continue
        candidates.append(text)
        for pattern in MODEL_PATTERNS:
            for match in re.findall(pattern, text, flags=re.I):
                if isinstance(match, tuple):
                    match = "".join(match)
                candidates.append(clean_text(match))
    normalized = []
    seen = set()
    for candidate in candidates:
        norm = normalize(candidate)
        if not norm or norm in seen:
            continue
        seen.add(norm)
        normalized.append((candidate, norm))
    return normalized


def build_product_index(products):
    by_exact = defaultdict(dict)
    by_manufacturer = defaultdict(list)
    for product in products:
        manufacturer = product.get("manufacturer")
        model_norm = normalize(product.get("model"))
        if not manufacturer or not model_norm:
            continue
        by_exact[manufacturer][model_norm] = product
        by_manufacturer[manufacturer].append((model_norm, product))
    return by_exact, by_manufacturer


def find_match(manufacturer, candidates, by_exact, by_manufacturer):
    for _raw, norm in candidates:
        product = by_exact.get(manufacturer, {}).get(norm)
        if product:
            return product, norm, "exact"

    for _raw, norm in candidates:
        if len(norm) < 5:
            continue
        possible = [product for model_norm, product in by_manufacturer.get(manufacturer, []) if model_norm and model_norm in norm]
        if len(possible) == 1:
            return possible[0], norm, "model-in-source"
    return None, "", ""


def main():
    products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8-sig"))
    by_exact, by_manufacturer = build_product_index(products)

    frame = pd.read_excel(EXCEL_PATH, sheet_name=0, header=None)
    rows = []
    for index, row in frame.iterrows():
        manufacturer = clean_text(row.iloc[0] if len(row) > 0 else "")
        type_or_name = clean_text(row.iloc[1] if len(row) > 1 else "")
        explicit_model = clean_text(row.iloc[2] if len(row) > 2 else "")
        if not manufacturer and not type_or_name and not explicit_model:
            continue
        rows.append((index + 1, manufacturer, type_or_name, explicit_model))

    for product in products:
        product.pop("inStock", None)
        product.pop("stockSource", None)

    matched = []
    unmatched = []
    for row_number, manufacturer, type_or_name, explicit_model in rows:
        if manufacturer not in MANUFACTURERS:
            unmatched.append((row_number, manufacturer, type_or_name, explicit_model, "unknown manufacturer"))
            continue
        candidates = model_candidates(type_or_name, explicit_model)
        product, candidate, method = find_match(manufacturer, candidates, by_exact, by_manufacturer)
        if not product:
            unmatched.append((row_number, manufacturer, type_or_name, explicit_model, "no product match"))
            continue
        product["inStock"] = True
        product["stockSource"] = SOURCE_LABEL
        matched.append((row_number, manufacturer, product["model"], product["slug"], candidate, method))

    PRODUCTS_PATH.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    matched_slugs = {item[3] for item in matched}
    manufacturer_counts = Counter(item[1] for item in matched if item[3] in matched_slugs)
    report = [
        "# 仓内现货产品匹配报告",
        "",
        f"- 来源文件：`{EXCEL_PATH}`",
        f"- 表格有效行：{len(rows)}",
        f"- 匹配记录：{len(matched)}",
        f"- 匹配唯一产品：{len(matched_slugs)}",
        f"- 未匹配行：{len(unmatched)}",
        "",
        "## 厂家匹配数量",
        "",
    ]
    for name, count in sorted(manufacturer_counts.items()):
        report.append(f"- {name}: {count}")
    if unmatched:
        report.extend(["", "## 未匹配行（前 120 条）", ""])
        for row_number, manufacturer, type_or_name, explicit_model, reason in unmatched[:120]:
            report.append(f"- 第 {row_number} 行：{manufacturer} / {type_or_name} / {explicit_model}（{reason}）")
        if len(unmatched) > 120:
            report.append(f"- 其余 {len(unmatched) - 120} 行略。")
    REPORT_PATH.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps({
        "rows": len(rows),
        "matchedRows": len(matched),
        "matchedProducts": len(matched_slugs),
        "unmatched": len(unmatched),
        "manufacturerCounts": dict(manufacturer_counts),
    }, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
