from pathlib import Path
import json
import re
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:/Users/Ning Sun/Desktop/2019焊材样本(2)(1).pdf")
DATA = ROOT / "data" / "jinqiao-products.json"
MANUFACTURER = "上海东风"
SOURCE = "上海东风 2019 焊材样本 PDF"

CATEGORY_NAMES = {
    "carbon-steel-electrodes": "碳钢焊条",
    "solid-wires": "实芯气保及氩弧焊丝",
    "flux-cored-wires": "药芯气保焊丝",
    "stainless-materials": "不锈钢焊材",
    "submerged-arc": "碳钢埋弧焊丝焊剂",
    "special-materials": "特种焊材",
}

BRAND_RE = re.compile(r"\b(?:YSH|SH)(?:\.[A-Za-z0-9][A-Za-z0-9.-]*|[A-Za-z0-9][A-Za-z0-9.-]+)\b")
PRODUCT_ROW_RE = re.compile(r"^\s*(?:(?:YSH|SH)(?:\.[A-Za-z0-9][A-Za-z0-9.-]*|[A-Za-z0-9][A-Za-z0-9.-]+)|(?:ER|J|A|R|D|G|Z|Y)[A-Z0-9][A-Z0-9.-]*)\s+\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\b")
ELEMENT_RE = re.compile(r"\b(C|Si|Mn|P|S|Ni|Cr|Mo|Cu|V|Nb|W|B|Al|Ti|N)\s*(?:(?!-)[^A-Za-z0-9\s]){1,4}\s*([0-9]+(?:\.[0-9]+)?(?:\s*[-~～]\s*[0-9]+(?:\.[0-9]+)?)?)")
MECH4_RE = re.compile(r"(?<![A-Za-z0-9.])(\d{3,4})\s+(\d{3,4})\s+(\d{1,2}(?:\.\d+)?)\s+((?:\d+\s*\([^)]*\))|(?:\d+)|(?:[��-�]+))(?![A-Za-z0-9.])")
MECH3_RE = re.compile(r"(?<![A-Za-z0-9.])(\d{3,4})\s+(\d{1,2}(?:\.\d+)?)\s+((?:\d+\s*\([^)]*\))|(?:\d+)|(?:[��-�]+))(?![A-Za-z0-9.])")

NB_NOTE = "NB/T 47018 承压产品"

TRANSLATIONS = [
    ("pure iron", "适用于纯铁焊接"),
    ("normal carbon steel sheet", "适用于普通碳钢薄板结构焊接"),
    ("low carbon steel", "适用于低碳钢结构焊接"),
    ("carbon steel and low alloy steel", "适用于碳钢及低合金钢结构焊接"),
    ("pressure equipment", "适用于承压设备相关结构焊接"),
    ("pressure vessel", "适用于压力容器相关结构焊接"),
    ("ship", "适用于船舶及船厂结构焊接"),
    ("bridge", "适用于桥梁及大型钢结构焊接"),
    ("offshore", "适用于海工平台及海洋工程结构焊接"),
    ("weather", "适用于耐候钢或耐大气腐蚀钢结构焊接"),
    ("heat-resistant", "适用于耐热钢焊接"),
    ("low temperature", "适用于低温钢焊接"),
    ("stainless", "适用于不锈钢或异种钢焊接"),
    ("cast iron", "适用于铸铁焊接或修复"),
    ("nickel", "适用于镍及镍基合金相关焊接"),
    ("hardfacing", "适用于堆焊耐磨修复"),
    ("surfacing", "适用于表面堆焊和耐磨修复"),
    ("vehicle", "适用于车辆及装备制造焊接"),
    ("petrochemical", "适用于石化设备及管道焊接"),
    ("pipe", "适用于管道或管件焊接"),
]

SECTION_BY_PAGE = {
    2: "非合金钢及细晶粒钢焊条",
    3: "非合金钢及细晶粒钢焊条",
    4: "非合金钢及细晶粒钢焊条",
    5: "非合金钢及细晶粒钢焊条",
    6: "高强钢焊条",
    7: "耐热钢焊条",
    8: "耐热钢与低温钢焊条",
    9: "不锈钢焊条",
    10: "不锈钢焊条",
    11: "不锈钢焊条",
    12: "不锈钢焊条",
    13: "铸铁与镍基焊条",
    14: "堆焊焊条",
    15: "堆焊焊条 / 非合金钢及细晶粒钢药芯焊丝",
    16: "非合金钢及细晶粒钢药芯焊丝 / 低温高强钢药芯焊丝",
    17: "耐热钢药芯焊丝 / 不锈钢药芯焊丝",
    18: "不锈钢药芯焊丝",
    19: "堆焊与高强钢药芯焊丝",
    20: "电渣焊焊丝 / 实芯气保焊丝 / 埋弧焊丝",
    21: "埋弧焊丝 / 不锈钢实芯焊丝",
    22: "不锈钢氩弧焊丝",
}

NON_ALLOY_FC = {
    "SH.Y71T-1", "SH.Y71T-1M", "SH.Y711", "SH.Y71Ni", "SH.Y70MC", "SH.Y71T-11", "SH.Y71T-GS",
}

SOLID_WIRE = {"SH.S49-1", "SH.S50-6", "YSH.S50-6"}
SUBMERGED = {"SH.M08A", "SH.M08MnA", "SH.M10Mn2"}
STAINLESS_SOLID = {"SH.S304", "SH.S308", "SH.S308L", "SH.S309", "SH.S309L", "SH.S316L", "SH.S321", "SH.S347"}
STAINLESS_EXPLICIT = {
    "SH.A002", "YSH.A002", "YSH.A002A", "YSH.A002LT", "SH.A002Nb",
    "SH.A022", "YSH.A022", "YSH.A022A", "YSH.A022LT", "YSH.A042A",
    "SH.A062", "YSH.A062A", "SH.A237", "SH.A242", "SH.A302",
    "YSH.A302", "YSH.A302A", "YSH.A307", "YSH.A312", "YSH.A312A",
    "SH.A402", "YSH.A402A", "SH.A407", "SH.A412", "SH.A422",
    "SH.A432", "SH.A462", "SH.A502", "SH.A507", "SH.A607",
    "SH.A707", "SH.A902", "SH.E2209", "YSH.E2209", "SH.E2553",
    "SH.E2594", "SH.G202", "SH.G207", "SH.G307", "SH.Y308L",
    "SH.Y309L", "SH.Y316L", "SH.Y309LMo", "SH.Y347L", "SH.Y2209",
    "SH.Y2594", "SH.Y409Ti", "SH.Y439Ti",
}

def normalize_standard_text(text):
    text = text.replace("AWSSE", "AWS E").replace("AWSSE", "AWS E")
    text = text.replace("AWS S E", "AWS E").replace("AWSS", "AWS ")
    text = text.replace("ASMESE", "ASME E").replace("ASME S E", "ASME E")
    text = text.replace("AWS A5.5S", "AWS A5.5")
    text = text.replace("SFA-5.5", "SFA-5.5")
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def normalize_table_standards(raw):
    standards = []
    for line in (raw or "").splitlines():
        value = normalize_standard_text(line)
        value = value.replace("AWSSE", "AWS E").replace("AWS A5.5S", "AWS A5.5 ")
        value = value.replace("ASMESE", "ASME E")
        value = value.replace("��", "").strip(" ,.;")
        if not value or value == "-":
            continue
        if len(value) > 3 and value not in standards:
            standards.append(value)
    if any(s.startswith("NB/T") for s in standards) and NB_NOTE not in standards:
        standards.append(NB_NOTE)
    return standards


def table_specs_by_page(pdf_path):
    specs = {}
    with pdfplumber.open(str(pdf_path)) as doc:
        for page_no, page in enumerate(doc.pages, 1):
            page_specs = []
            for table in page.extract_tables() or []:
                if not table:
                    continue
                header = " ".join(str(cell or "") for cell in table[0])
                if "SIZE" not in header or "SPECIFICATION" not in header:
                    continue
                for row in table[1:]:
                    if not row or len(row) < 3:
                        continue
                    size = (row[1] or "").strip()
                    standards = normalize_table_standards(row[2] or "")
                    if size or standards:
                        page_specs.append({"size": size, "standards": standards})
            specs[page_no] = page_specs
    return specs

def extract_standards(context):
    text = normalize_standard_text(context)
    standards = []
    patterns = [
        r"GB/T\s+[0-9A-Z./-]*\s*[A-Z][A-Z0-9.-]*(?:\s*[A-Z0-9.-]+)?",
        r"NB/T\s+(?:47018\.\d+\s*)?[A-Z0-9./-]+(?:\s+[A-Z0-9.-]+)?",
        r"AWS\s+(?:A5\.\d+\s*)?[A-Z]{0,3}[0-9A-Z.-]+",
        r"ASME\s+(?:SFA-5\.5\s*)?[A-Z]{0,3}[0-9A-Z.-]+",
    ]
    for pattern in patterns:
        for match in re.findall(pattern, text):
            value = re.sub(r"\s+", " ", match).strip(" ,.;")
            value = value.replace("AWS E ", "AWS E")
            value = re.sub(r"\s+(?:YSH|SH)[.A-Za-z0-9-].*$", "", value).strip()
            value = re.sub(r"\s+(?:AC|DC|CO)$", "", value).strip()
            if len(value) > 3 and value not in standards and not re.search(r"[�]{2,}", value):
                standards.append(value)
    if any(s.startswith("NB/T") for s in standards) and NB_NOTE not in standards:
        standards.append(NB_NOTE)
    return standards

def extract_composition(context):
    found = []
    seen = set()
    for name, value in ELEMENT_RE.findall(context):
        key = (name, value.replace(" ", ""))
        if key in seen:
            continue
        seen.add(key)
        found.append({"name": name, "value": value.replace(" ", "") + "%"})
    return found[:12]

def extract_mechanical(context):
    compact = re.sub(r"\s+", " ", context)
    matches = MECH4_RE.findall(compact)
    if matches:
        yp, ts, el, iv = matches[-1]
        return [
            {"name": "屈服强度", "value": yp + " MPa"},
            {"name": "抗拉强度", "value": ts + " MPa"},
            {"name": "伸长率", "value": el + "%"},
            {"name": "冲击吸收能量", "value": iv.replace(" ", "")},
        ]
    matches = MECH3_RE.findall(compact)
    if matches:
        ts, el, iv = matches[-1]
        return [
            {"name": "抗拉强度", "value": ts + " MPa"},
            {"name": "伸长率", "value": el + "%"},
            {"name": "冲击吸收能量", "value": iv.replace(" ", "")},
        ]
    hardness = re.search(r"(?:HRC|HB)\s*[^0-9]*(\d+)", context)
    if hardness:
        scale = "HRC" if "HRC" in hardness.group(0) else "HB"
        return [{"name": "熔敷金属硬度", "value": scale + " " + hardness.group(1)}]
    return []

def english_application(context):
    text = re.sub(r"\s+", " ", context)
    m = re.search(r"\b(?:For|Used|Suitable|Applied|Applicable|It is suitable|Low carbon|Metallic powder|All position|E71T-GS)\b.*", text, re.I)
    if not m:
        return ""
    app = m.group(0)
    app = re.split(r"\s+(?:GB/T|NB/T|AWS|ASME|C[��<=]|S[��<=]|P[��<=]|\d+\s+\d+)\b", app)[0]
    return app.strip(" .;,")[:360]

def summarize_application(english, category_name, section):
    apps = [category_name]
    low = english.lower()
    for key, value in TRANSLATIONS:
        if key in low and value not in apps:
            apps.append(value)
    if len(apps) == 1:
        apps.append("适用于" + section + "相关焊接工况")
    apps.append("按母材、执行标准、焊接位置和项目工况复核选型")
    return apps[:5]

def classify(model, page):
    if model in STAINLESS_EXPLICIT:
        return "stainless-materials"
    if model in SOLID_WIRE:
        return "solid-wires"
    if model in SUBMERGED:
        return "submerged-arc"
    if model in STAINLESS_SOLID:
        return "stainless-materials"
    if model in NON_ALLOY_FC:
        return "flux-cored-wires"
    if model.startswith("SH.Y") or model.startswith("YSH.Y"):
        return "special-materials"
    if page in (2, 3, 4, 5):
        return "carbon-steel-electrodes"
    return "special-materials"

def product_type_label(model, category, section):
    if category == "carbon-steel-electrodes" or model.startswith(("SH.J", "YSH.J", "SH.E", "YSH.E", "SH.A", "YSH.A", "SH.G", "SH.Z", "SH.D", "SH.Ni", "YSH.R", "SH.W")):
        return "焊条"
    if category == "flux-cored-wires" or model.startswith("SH.Y"):
        return "药芯焊丝"
    if category == "solid-wires":
        return "实芯焊丝"
    if category == "submerged-arc":
        return "埋弧焊丝"
    if category == "stainless-materials":
        return "不锈钢焊丝"
    return section

def slugify(model):
    return "dongfeng-" + re.sub(r"[^a-z0-9]+", "-", model.lower()).strip("-")

def build_windows(pdf_path):
    entries = []
    specs_by_page = table_specs_by_page(pdf_path)
    with pdfplumber.open(str(pdf_path)) as doc:
        for page_no, page in enumerate(doc.pages, 1):
            if page_no == 1:
                continue
            text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            lines = text.splitlines()
            boundary_indices = [line_idx for line_idx, line in enumerate(lines) if PRODUCT_ROW_RE.search(line)]
            starts = []
            for idx, line in enumerate(lines):
                for match in BRAND_RE.finditer(line):
                    model = match.group(0)
                    if model in ("SHIELDED", "SH."):
                        continue
                    starts.append((idx, match.start(), model))
            seen = set()
            product_index = 0
            page_specs = specs_by_page.get(page_no, [])
            for pos, (idx, _start, model) in enumerate(starts):
                if (page_no, model) in seen:
                    continue
                seen.add((page_no, model))
                next_idx = next((line_idx for line_idx in boundary_indices if line_idx > idx), min(len(lines), idx + 7))
                start_idx = idx
                end_idx = min(len(lines), max(next_idx, idx + 1))
                window = "\n".join(lines[start_idx:end_idx])
                meta = page_specs[product_index] if product_index < len(page_specs) else {}
                entries.append((page_no, model, window, meta))
                product_index += 1
    return entries
def make_product(page, model, context, meta=None):
    category = classify(model, page)
    category_name = CATEGORY_NAMES[category]
    section = SECTION_BY_PAGE.get(page, "东风焊材")
    composition = extract_composition(context)
    deposited = extract_mechanical(context)
    meta = meta or {}
    standards = meta.get("standards") or extract_standards(context)
    english = english_application(context)
    type_label = product_type_label(model, category, section)
    dimensions = []
    size_value = (meta.get("size") or "").strip()
    if size_value and not re.search(r"[�]", size_value):
        dimensions.append({"name": "规格直径", "value": "Φ" + size_value.replace(" ", "") + " mm"})
    else:
        model_line = next((line for line in context.splitlines() if model in line), "")
        dimensions_match = re.search(re.escape(model) + r"\s+(\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?)\b", model_line)
        if dimensions_match:
            dimensions.append({"name": "规格直径", "value": "Φ" + dimensions_match.group(1).replace(" ", "") + " mm"})
    intro = f"{model} \u4e3a\u4e0a\u6d77\u4e1c\u98ce{type_label}\u3002"
    intro += "\u8be6\u60c5\u9875\u6309\u73b0\u6709\u4ea7\u54c1\u683c\u5f0f\u6574\u7406\u6267\u884c\u6807\u51c6\u3001\u5178\u578b\u5316\u5b66\u6210\u5206\u548c\u7194\u6577\u91d1\u5c5e\u529b\u5b66\u6027\u80fd\uff0c\u4fbf\u4e8e\u91c7\u8d2d\u548c\u9879\u76ee\u9009\u578b\u590d\u6838\u3002"
    notes = "\u6570\u636e\u7531\u4e0a\u6d77\u4e1c\u98ce 2019 \u710a\u6750\u6837\u672c PDF \u62bd\u53d6\uff1b\u6700\u65b0\u5185\u5bb9\u8bf7\u8054\u7cfb\u4e1a\u52a1\u54a8\u8be2\uff1b\u5b9e\u9645\u5e93\u5b58\u6570\u91cf\u5b9e\u65f6\u53d8\u52a8\uff0c\u8bf7\u4e8e\u9500\u552e\u8ba2\u8d27\u65f6\u4e8c\u6b21\u6838\u5b9e\u3002"
    if any(s.startswith("NB/T") for s in standards):
        notes += " 含 NB/T 项目，已补充 NB/T 47018 承压产品标识。"
    return {
        "slug": slugify(model),
        "manufacturer": MANUFACTURER,
        "categorySlug": category,
        "categoryName": category_name,
        "model": model,
        "name": f"上海东风 {model} {category_name}",
        "standard": " / ".join(standards),
        "standards": standards,
        "summary": f"上海东风 {model}，适用于{category_name}相关工况。",
        "introduction": intro,
        "applications": summarize_application(english, category_name, section),
        "composition": composition,
        "depositedMetal": deposited,
        "dimensions": dimensions,
        "notes": notes,
        "source": SOURCE,
        "sourcePage": page,
    }

def main():
    products = json.loads(DATA.read_text(encoding="utf-8-sig"))
    entries = build_windows(PDF)
    new = []
    seen = set()
    for page, model, context, meta in entries:
        if model in seen:
            continue
        seen.add(model)
        new.append(make_product(page, model, context, meta))
    products = [p for p in products if p.get("manufacturer") != MANUFACTURER]
    products.extend(new)
    DATA.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = {}
    for p in new:
        counts[p["categorySlug"]] = counts.get(p["categorySlug"], 0) + 1
    print("Imported", len(new), "Dongfeng products")
    print(json.dumps(counts, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()







