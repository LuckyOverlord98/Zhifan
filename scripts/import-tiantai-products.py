import json
import math
import re
from collections import Counter
from pathlib import Path

import openpyxl


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path(r"C:\Users\Ning Sun\Documents\Codex\2026-06-27\implement-this-ui-in-the-current-6\outputs")
SOURCE_GLOB = "*4x*.xlsx"
PRODUCTS_PATH = ROOT / "data" / "jinqiao-products.json"
REPORT_PATH = ROOT / "docs" / "tiantai-import-report.md"

MANUFACTURER = "\u5929\u6cf0"
CATEGORY_NAMES = {
    "carbon-steel-electrodes": "\u78b3\u94a2\u710a\u6761",
    "solid-wires": "\u5b9e\u82af\u6c14\u4fdd\u53ca\u6c29\u5f27\u710a\u4e1d",
    "flux-cored-wires": "\u836f\u82af\u6c14\u4fdd\u710a\u4e1d",
    "stainless-materials": "\u4e0d\u9508\u94a2\u710a\u6750",
    "submerged-arc": "\u78b3\u94a2\u57cb\u5f27\u710a\u4e1d\u710a\u5242",
    "aluminum-wires": "\u94dd\u710a\u4e1d\u4e0e\u7279\u79cd\u710a\u6750",
    "special-materials": "\u7279\u79cd\u710a\u6750",
}

CHEMISTRY_COLUMNS = [
    ("C", "\u5316\u5b66C"),
    ("Mn", "\u5316\u5b66Mn"),
    ("Si", "\u5316\u5b66Si"),
    ("P", "\u5316\u5b66P"),
    ("S", "\u5316\u5b66S"),
    ("Cu", "\u5316\u5b66Cu"),
    ("Ni", "\u5316\u5b66Ni"),
    ("Cr", "\u5316\u5b66Cr"),
    ("Mo", "\u5316\u5b66Mo"),
    ("V", "\u5316\u5b66V"),
    ("Nb", "\u5316\u5b66Nb"),
    ("Al", "\u5316\u5b66Al"),
    ("Ti", "\u5316\u5b66Ti"),
    ("B", "\u5316\u5b66B"),
    ("W", "\u5316\u5b66W"),
    ("Co", "\u5316\u5b66Co"),
    ("N", "\u5316\u5b66N"),
]

MECHANICAL_COLUMNS = [
    ("\u5c48\u670d\u5f3a\u5ea6", "\u673a\u68b0\u5c48\u670d\u5f3a\u5ea6MPa", "MPa"),
    ("\u6297\u62c9\u5f3a\u5ea6", "\u673a\u68b0\u6297\u62c9\u5f3a\u5ea6MPa", "MPa"),
    ("\u5ef6\u4f38\u7387", "\u673a\u68b0\u5ef6\u4f38\u7387%", "%"),
    ("\u51b2\u51fb\u503c", "\u673a\u68b0\u51b2\u51fb\u503c", ""),
    ("PWHT", "PWHT", ""),
]

OPERATIONAL_FIELDS = (
    "inStock",
    "stockSource",
    "clickCount",
    "lastClickedAt",
    "createdAt",
    "updatedAt",
)


def is_blank(value):
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    text = str(value).strip()
    return not text or text.lower() in {"nan", "none", "null"}


def clean_text(value):
    if is_blank(value):
        return ""
    text = str(value)
    replacements = {
        "\u3000": " ",
        "\r\n": "\n",
        "\r": "\n",
        "\u2103": "\u00b0C",
        "\uff08": "(",
        "\uff09": ")",
        "\uff1a": ":",
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


def normalize_model(value):
    model = clean_inline(value)
    model = model.replace("\uff0e", ".").replace("\u3002", ".")
    model = model.replace("\uff08", "(").replace("\uff09", ")")
    model = model.replace("\uff0d", "-").replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    return model.strip()


def model_key(value):
    model = normalize_model(value).upper()
    return re.sub(r"[^A-Z0-9]+", "", model)


def slugify_model(model):
    slug = normalize_model(model).lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-") or "unknown"


def find_excel_path():
    matches = sorted(SOURCE_DIR.glob(SOURCE_GLOB), key=lambda item: item.stat().st_mtime, reverse=True)
    if not matches:
        raise FileNotFoundError(f"No source workbook matching {SOURCE_GLOB!r} under {SOURCE_DIR}")
    return matches[0]


def read_source_rows(excel_path):
    workbook = openpyxl.load_workbook(excel_path, data_only=True, read_only=True)
    sheet = workbook.worksheets[0]
    headers = [clean_inline(cell.value) for cell in sheet[1]]
    rows = []
    for row_index, cells in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        row = {headers[index]: value for index, value in enumerate(cells) if index < len(headers) and headers[index]}
        row["_sourceRow"] = row_index
        rows.append(row)
    workbook.close()
    return rows


def category_for(row):
    product_type = clean_inline(row.get("\u7c7b\u578b"))
    group = clean_inline(row.get("\u4e0a\u65b9\u5206\u7c7b"))
    product_name = clean_inline(row.get("\u4ea7\u54c1\u547d\u540d"))
    combined = f"{product_type} {group} {product_name}"

    if product_type == "\u4e0d\u9508\u94a2\u710a\u6750" or "\u4e0d\u9508\u94a2" in combined:
        return "stainless-materials"
    if product_type == "\u836f\u82af\u6c14\u4fdd\u710a\u4e1d":
        return "flux-cored-wires"
    if product_type == "\u710a\u5242":
        return "submerged-arc"
    if product_type == "\u7279\u79cd\u710a\u6750":
        return "special-materials"
    if product_type == "\u78b3\u94a2\u53ca\u9ad8\u5f3a\u94a2\u710a\u6750":
        if "\u57cb\u5f27" in combined or "\u710a\u5242" in combined:
            return "submerged-arc"
        if "\u836f\u82af" in combined:
            return "flux-cored-wires"
        if "\u6c14\u4fdd\u710a\u4e1d" in combined or "\u6c29\u5f27\u710a\u4e1d" in combined or "\u91d1\u5c5e\u7c89\u578b\u710a\u4e1d" in combined or "\u710a\u4e1d" in combined:
            return "solid-wires"
        if "\u624b\u710a\u6761" in combined or "\u710a\u6761" in combined:
            return "carbon-steel-electrodes"
        return "carbon-steel-electrodes"
    if "\u94dd" in combined:
        return "aluminum-wires"
    if "\u57cb\u5f27" in combined or "\u710a\u5242" in combined:
        return "submerged-arc"
    if "\u836f\u82af" in combined:
        return "flux-cored-wires"
    if "\u710a\u4e1d" in combined:
        return "solid-wires"
    if "\u710a\u6761" in combined:
        return "carbon-steel-electrodes"
    return "special-materials"


def safe_number_text(value, unit="", element=None, mechanical=None, anomalies=None, model=None):
    if is_blank(value):
        return ""
    text = clean_inline(value)
    if not text:
        return ""
    text = text.replace("\u2103", "\u00b0C").replace("\u00b0\u00b0C", "\u00b0C")
    if re.search(r"\d+E\d+", text, re.I):
        if anomalies is not None:
            anomalies.append(f"{model or ''} {element or mechanical or ''}: suspicious exponential value {text}")
        return ""
    if element:
        numbers = [float(item) for item in re.findall(r"(?<![A-Za-z])\d+(?:\.\d+)?", text)]
        if numbers and max(numbers) > 50:
            if anomalies is not None:
                anomalies.append(f"{model or ''} {element}: suspicious chemistry value {text}")
            return ""
    if unit and unit not in text:
        return f"{text}{unit}"
    return text


def normalize_standard(value):
    item = clean_inline(value)
    item = re.sub(r"\bGB\s*/\s*T\b", "GB/T", item, flags=re.I)
    item = re.sub(r"\bGB\s+T\b", "GB/T", item, flags=re.I)
    item = re.sub(r"\bGB/T\s+GB/T\s+", "GB/T ", item, flags=re.I)
    item = re.sub(r"\bISO\s+ISO\s+", "ISO ", item, flags=re.I)
    item = re.sub(r"\s+", " ", item).strip()
    return item


def split_standards(*values):
    standards = []
    for value in values:
        text = clean_text(value)
        if not text:
            continue
        for part in re.split(r"[\n;\uff1b]+", text):
            item = normalize_standard(part)
            if item and item not in standards:
                standards.append(item)
    return standards


def build_composition(row, model, anomalies):
    rows = []
    for element, column in CHEMISTRY_COLUMNS:
        value = safe_number_text(row.get(column), element=element, anomalies=anomalies, model=model)
        if value:
            rows.append({"name": element, "value": value})
    return rows


def build_deposited_metal(row, model, anomalies):
    rows = []
    for name, column, unit in MECHANICAL_COLUMNS:
        value = safe_number_text(row.get(column), unit=unit, mechanical=name, anomalies=anomalies, model=model)
        if value:
            rows.append({"name": name, "value": value})
    return rows


def build_dimensions(row):
    ocr = clean_text(row.get("OCR\u539f\u6587"))
    if not ocr:
        return []
    specs = []
    for line in ocr.split("\n"):
        if not any(word in line for word in ("\u76f4\u5f84", "\u7ebf\u5f84", "\u4e1d\u5f84")):
            continue
        for spec in re.findall(r"(?:\u03a6|\u03c6|\uffe0)?\s*(\d+(?:\.\d+)?(?:\s*[xX]\s*\d+)?)\s*(?:mm|MM|\u6beb\u7c73)?", line):
            value = re.sub(r"\s+", "", spec).replace("x", "X")
            if value and value not in specs and len(specs) < 8:
                specs.append(value)
    if not specs:
        return []
    return [{"name": "\u89c4\u683c", "value": " / ".join(f"\u03a6{item}" for item in specs)}]


def fallback_summary(model, category_name, intro, applications):
    source = clean_inline(intro) or clean_inline(applications)
    if source:
        first = re.split(r"[\u3002\uff01\uff1f.!?]", source)[0].strip()
        if first:
            return f"{MANUFACTURER} {model}\uff0c{category_name}\u3002{first}\u3002"
    return f"{MANUFACTURER} {model}\uff0c{category_name}\uff0c\u9002\u7528\u4e8e\u76f8\u5e94\u6bcd\u6750\u3001\u5f3a\u5ea6\u7b49\u7ea7\u548c\u710a\u63a5\u5de5\u51b5\u7684\u9879\u76ee\u9009\u578b\u3002"


def data_score(product):
    score = 0
    for key in ("introduction", "applications", "standards", "composition", "depositedMetal", "dimensions"):
        value = product.get(key)
        if isinstance(value, list):
            score += len(value) * 3
        elif value:
            score += 5
    score += len(product.get("summary", "")) // 20
    return score


def build_products(excel_path):
    products = []
    skipped = []
    anomalies = []
    source_name = excel_path.name

    for row in read_source_rows(excel_path):
        source_row = int(row.get("_sourceRow") or 0)
        if clean_inline(row.get("\u54c1\u724c")) != MANUFACTURER:
            continue
        model = normalize_model(row.get("\u724c\u53f7"))
        if not model:
            skipped.append(source_row)
            continue

        category_slug = category_for(row)
        category_name = CATEGORY_NAMES[category_slug]
        product_name = clean_inline(row.get("\u4ea7\u54c1\u547d\u540d"))
        introduction = clean_text(row.get("\u7279\u6027"))
        applications = clean_text(row.get("\u5e94\u7528\u573a\u666f"))
        standards = split_standards(row.get("\u56fd\u6807"), row.get("\u7f8e\u6807"), row.get("\u56fd\u9645\u6807\u51c6"))
        page = clean_inline(row.get("\u9875\u7801"))
        position = clean_inline(row.get("\u4f4d\u7f6e"))
        source = source_name
        if page:
            source += f"\uff1b\u9875\u7801\uff1a{page}"
        if position:
            source += f"\uff1b\u4f4d\u7f6e\uff1a{position}"

        display_name = f"{MANUFACTURER} {model} {product_name}" if product_name else f"{MANUFACTURER} {model} {category_name}"
        product = {
            "slug": f"tiantai-{slugify_model(model)}",
            "manufacturer": MANUFACTURER,
            "categorySlug": category_slug,
            "categoryName": category_name,
            "model": model,
            "name": display_name,
            "standard": " / ".join(standards),
            "standards": standards,
            "summary": fallback_summary(model, category_name, introduction, applications),
            "introduction": introduction,
            "applications": [applications] if applications else [],
            "composition": build_composition(row, model, anomalies),
            "depositedMetal": build_deposited_metal(row, model, anomalies),
            "dimensions": build_dimensions(row),
            "certifications": [],
            "notes": "\u4ee5\u5929\u6cf0\u6700\u65b0\u4ea7\u54c1\u624b\u518c\u3001\u8d28\u4fdd\u4e66\u53ca\u9879\u76ee\u6280\u672f\u6761\u4ef6\u4e3a\u51c6\uff1b\u5173\u952e\u5de5\u7a0b\u8bf7\u7ed3\u5408 WPS/PQR \u590d\u6838\uff1b\u6700\u65b0\u5185\u5bb9\u8bf7\u8054\u7cfb\u4e1a\u52a1\u54a8\u8be2\uff1b\u5b9e\u9645\u5e93\u5b58\u6570\u91cf\u5b9e\u65f6\u53d8\u52a8\uff0c\u8bf7\u4e8e\u9500\u552e\u8ba2\u8d27\u65f6\u4e8c\u6b21\u6838\u5b9e\u3002",
            "source": source,
            "_sourceRow": source_row,
        }
        products.append(product)

    by_key = {}
    duplicates = []
    for product in products:
        key = model_key(product["model"])
        if key in by_key:
            duplicates.append((by_key[key]["model"], product["model"]))
            if data_score(product) > data_score(by_key[key]):
                by_key[key] = product
        else:
            by_key[key] = product

    return list(by_key.values()), skipped, duplicates, anomalies


def preserve_existing_fields(new_product, existing_product):
    merged = dict(new_product)
    for field in OPERATIONAL_FIELDS:
        if field in existing_product:
            merged[field] = existing_product[field]
    return merged


def merge_products(existing, source_products):
    source_by_key = {model_key(item.get("model")): item for item in source_products}
    existing_tiantai_by_key = {
        model_key(item.get("model")): item for item in existing if item.get("manufacturer") == MANUFACTURER
    }
    used_source_keys = set()
    merged = []
    overwritten = 0
    retained_missing = 0

    for item in existing:
        if item.get("manufacturer") != MANUFACTURER:
            merged.append(item)
            continue
        key = model_key(item.get("model"))
        replacement = source_by_key.get(key)
        if replacement:
            merged.append(preserve_existing_fields(replacement, item))
            used_source_keys.add(key)
            overwritten += 1
        else:
            merged.append(item)
            retained_missing += 1

    added = []
    for product in source_products:
        key = model_key(product.get("model"))
        if key not in existing_tiantai_by_key and key not in used_source_keys:
            added.append(product)
            merged.append(product)
            used_source_keys.add(key)

    return merged, overwritten, added, retained_missing


def main():
    excel_path = find_excel_path()
    source_products, skipped, duplicates, anomalies = build_products(excel_path)
    existing = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8-sig"))
    merged, overwritten, added, retained_missing = merge_products(existing, source_products)
    PRODUCTS_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    final_tiantai = [item for item in merged if item.get("manufacturer") == MANUFACTURER]
    source_counts = Counter(item["categoryName"] for item in source_products)
    final_counts = Counter(item["categoryName"] for item in final_tiantai)
    missing = {
        "\u4ecb\u7ecd": sum(not item.get("introduction") for item in source_products),
        "\u9002\u7528\u573a\u666f": sum(not item.get("applications") for item in source_products),
        "\u6267\u884c\u6807\u51c6": sum(not item.get("standards") for item in source_products),
        "\u6210\u5206": sum(not item.get("composition") for item in source_products),
        "\u7194\u6577\u91d1\u5c5e": sum(not item.get("depositedMetal") for item in source_products),
    }

    report = [
        "# \u5929\u6cf0\u4ea7\u54c1\u5bfc\u5165\u62a5\u544a",
        "",
        f"- \u6765\u6e90\u6587\u4ef6\uff1a`{excel_path}`",
        f"- \u5bfc\u5165\u5382\u5bb6\uff1a{MANUFACTURER}",
        f"- \u65b0\u7248\u8868\u683c\u6709\u6548\u4ea7\u54c1\uff1a{len(source_products)} \u4e2a",
        f"- \u540c\u578b\u53f7\u8986\u76d6\uff1a{overwritten} \u4e2a",
        f"- \u65b0\u589e\u4ea7\u54c1\uff1a{len(added)} \u4e2a",
        f"- \u672a\u5728\u65b0\u8868\u4e2d\u51fa\u73b0\u4f46\u4fdd\u7559\uff1a{retained_missing} \u4e2a",
        f"- \u5f53\u524d\u5929\u6cf0\u603b\u4ea7\u54c1\uff1a{len(final_tiantai)} \u4e2a",
        f"- \u8df3\u8fc7\u7a7a\u724c\u53f7\u884c\uff1a{len(skipped)}",
        f"- \u91cd\u590d\u578b\u53f7\u5408\u5e76\uff1a{len(duplicates)} \u7ec4",
        "",
        "## \u65b0\u7248\u6765\u6e90\u5206\u7c7b\u6570\u91cf",
        "",
    ]
    for name, count in sorted(source_counts.items()):
        report.append(f"- {name}: {count}")
    report.extend(["", "## \u5f53\u524d\u5929\u6cf0\u5e93\u5185\u5206\u7c7b\u6570\u91cf", ""])
    for name, count in sorted(final_counts.items()):
        report.append(f"- {name}: {count}")
    report.extend(["", "## \u65b0\u7248\u6765\u6e90\u7f3a\u5931\u5b57\u6bb5\u7edf\u8ba1", ""])
    for name, count in missing.items():
        report.append(f"- {name}: {count}")
    report.extend(["", "## \u6570\u636e\u6e05\u6d17\u8bf4\u660e", ""])
    report.append("- \u540c\u578b\u53f7\u6309\u53bb\u9664\u7a7a\u683c\u3001\u70b9\u53f7\u3001\u8fde\u5b57\u7b26\u3001\u62ec\u53f7\u540e\u7684\u7edf\u4e00 key \u5339\u914d\uff0c\u4fdd\u7559 -II \u7b49\u540e\u7f00\u7684\u5b9e\u9645\u5b57\u6bcd\u4fe1\u606f\u3002")
    report.append("- \u65b0\u8868\u5df2\u6709\u540c\u578b\u53f7\u8986\u76d6\u5929\u6cf0\u65e7\u8bb0\u5f55\uff0c\u4f46\u4fdd\u7559\u73b0\u8d27\u6807\u8bc6\u3001\u70b9\u51fb\u91cf\u7b49\u7ad9\u5185\u8fd0\u8425\u5b57\u6bb5\u3002")
    report.append("- \u6210\u5206\u4f7f\u7528\u8868\u683c\u4e2d `\u5316\u5b66C` \u81f3 `\u5316\u5b66N` \u7684\u7ed3\u6784\u5316\u5217\uff0c\u7194\u6577\u91d1\u5c5e\u4f7f\u7528\u529b\u5b66\u6027\u80fd\u5217\uff0c\u89c4\u683c\u7c97\u7ec6\u5355\u72ec\u5b58\u5165 dimensions\u3002")
    if duplicates:
        report.extend(["", "## \u5408\u5e76\u7684\u91cd\u590d\u578b\u53f7\u793a\u4f8b", ""])
        for old, new in duplicates[:30]:
            report.append(f"- {old} / {new}")
    if anomalies:
        report.extend(["", "## \u6e05\u6d17\u5f02\u5e38\u503c", ""])
        for item in anomalies[:80]:
            report.append(f"- {item}")
    REPORT_PATH.write_text("\n".join(report) + "\n", encoding="utf-8")

    print(f"source={len(source_products)} overwritten={overwritten} added={len(added)} retained_missing={retained_missing} final_tiantai={len(final_tiantai)}")


if __name__ == "__main__":
    main()
