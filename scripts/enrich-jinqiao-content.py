from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "jinqiao-products.json"

MANUAL_ROOT = Path(r"C:/Users/Ning Sun/Documents/Codex/2026-06-26/readme-zh-cn-md-https-github/outputs")
TEXT_SOURCES = [
    MANUAL_ROOT / "1_2024产品手册_extracted.txt",
    MANUAL_ROOT / "1_2024产品手册_pymupdf.txt",
    MANUAL_ROOT / "1_2024产品手册_extracted.md",
]

GENERIC_INTRO = "详情页整理执行标准"
GENERIC_APPLICATION = "按母材、强度等级"

STOP_LABELS = [
    "电源极性",
    "熔敷金属",
    "堆焊金属",
    "化学成分",
    "参考电流",
    "焊接工艺要点",
    "认证情况",
    "包装",
]


def normalize_model(value: str) -> str:
    value = value.upper()
    value = value.replace("·", ".").replace("•", ".").replace("．", ".").replace("。", ".")
    value = value.replace("－", "-").replace("–", "-").replace("—", "-")
    value = re.sub(r"<BR\s*/?>", "", value, flags=re.I)
    value = re.sub(r"（.*?）|\(.*?\)", "", value)
    value = re.sub(r"[^A-Z0-9.-]", "", value)
    value = value.replace(".", "")
    return value


def clean_line(value: str) -> str:
    value = re.sub(r"<br\s*/?>", "", value, flags=re.I)
    value = value.replace("|", " ")
    value = value.replace("≤ ≤", "≤")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def clean_field(value: str) -> str:
    lines = [clean_line(line) for line in value.splitlines()]
    value = "".join(line for line in lines if line)
    value = value.replace("H S", "H2S").replace("S、H S", "S、H2S")
    value = value.replace("DC +", "DC+").replace("DC -", "DC-")
    value = re.sub(r"\s+", " ", value)
    value = value.replace(" 。", "。").replace(" ，", "，")
    value = value.replace("用途：", "").replace("特性：", "").replace("说明：", "")
    return value.strip(" ；;。") + ("。" if value.strip() and not value.strip().endswith(("。", "；", ";")) else "")


def split_pages(content: str, source_name: str) -> list[dict]:
    if "===== Page " in content:
        parts = re.split(r"===== Page\s+(\d+)\s+=====", content)
    else:
        parts = re.split(r"## Page\s+(\d+)", content)
    pages = []
    for index in range(1, len(parts), 2):
        page_no = int(parts[index])
        body = parts[index + 1]
        pages.append({"page": page_no, "body": body, "source": source_name})
    return pages


def candidate_model_lines(body: str) -> list[str]:
    lines = [clean_line(line) for line in body.splitlines()]
    result = []
    for line in lines[:24]:
        if not line or "Table" in line or "简明表" in line:
            continue
        if line.startswith(("GB/T", "AWS", "ISO", "JIS", "NB/T", "企业标准", "用途", "特性", "说明")):
            continue
        token = re.match(r"^(?:JQ[.·•-]?)?[A-Za-z]?[A-Za-z0-9][A-Za-z0-9.·•-]{1,30}", line)
        if token:
            result.append(token.group(0))
    return result


def extract_label(body: str, labels: tuple[str, ...], stops: list[str]) -> str:
    label_pattern = "|".join(re.escape(label) for label in labels)
    stop_pattern = "|".join(re.escape(label) for label in stops)
    pattern = rf"(?:{label_pattern})[:：]\s*(.*?)(?=(?:{stop_pattern})[:：]|$)"
    match = re.search(pattern, body, flags=re.S)
    if not match:
        return ""
    return clean_field(match.group(1))


def application_items(purpose: str) -> list[str]:
    text = purpose.strip(" 。")
    if not text:
        return []
    text = text.replace("常见应用领域为", "常见应用领域：")
    pieces = []
    for chunk in re.split(r"[。；;]", text):
        chunk = chunk.strip(" ，,")
        if not chunk:
            continue
        if "，常见应用领域：" in chunk:
            left, right = chunk.split("，常见应用领域：", 1)
            pieces.extend([left, "常见应用领域：" + right])
        elif "，如" in chunk and len(chunk) > 80:
            left, right = chunk.split("，如", 1)
            pieces.extend([left, "典型材料或项目：如" + right])
        else:
            pieces.append(chunk)
    result = []
    seen = set()
    for item in pieces:
        item = re.sub(r"\s+", " ", item).strip(" ，,。")
        if not item:
            continue
        if not item.startswith(("适用于", "常见应用领域", "典型材料", "主要用于")):
            item = "适用于" + item
        key = item.replace(" ", "")
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result[:5]


def build_manual_records() -> dict[str, dict]:
    records: dict[str, dict] = {}
    for source in TEXT_SOURCES:
        if not source.exists():
            continue
        content = source.read_text(encoding="utf-8", errors="ignore")
        for page in split_pages(content, source.name):
            body = page["body"]
            if "用途" not in body or not ("特性" in body or "说明" in body):
                continue
            if "简明表" in body and "电源极性" not in body:
                continue
            purpose = extract_label(body, ("用途",), ["特性", "说明", *STOP_LABELS])
            intro = extract_label(body, ("特性", "说明"), STOP_LABELS)
            if not purpose and not intro:
                continue
            for line in candidate_model_lines(body):
                key = normalize_model(line)
                if not key or len(key) < 3:
                    continue
                current = records.get(key)
                score = (1 if purpose else 0) + (1 if intro else 0)
                if current and current["score"] >= score:
                    continue
                records[key] = {
                    "modelLine": line,
                    "purpose": purpose,
                    "intro": intro,
                    "applications": application_items(purpose),
                    "page": page["page"],
                    "source": page["source"],
                    "score": score,
                }
    return records


def product_keys(model: str) -> list[str]:
    keys = [normalize_model(model)]
    if model.startswith("JQ."):
        keys.append(normalize_model(model.replace("JQ.", "JQ-")))
    if model.startswith("JQ-"):
        keys.append(normalize_model(model.replace("JQ-", "JQ.")))
    if not model.startswith(("JQ.", "JQ-")):
        keys.append(normalize_model("JQ." + model))
    return list(dict.fromkeys(keys))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write updates into data/jinqiao-products.json")
    args = parser.parse_args()

    products = json.loads(DATA_PATH.read_text(encoding="utf-8-sig"))
    records = build_manual_records()

    matched = []
    unmatched_generic = []
    for product in products:
        if product.get("manufacturer") != "金桥":
            continue
        record = None
        for key in product_keys(product.get("model", "")):
            record = records.get(key)
            if record:
                break
        if not record:
            if GENERIC_INTRO in product.get("introduction", "") or any(GENERIC_APPLICATION in item for item in product.get("applications", [])):
                unmatched_generic.append(product.get("model", ""))
            continue

        changed_fields = []
        if record["intro"]:
            product["introduction"] = record["intro"]
            changed_fields.append("introduction")
        if record["applications"]:
            product["applications"] = record["applications"]
            changed_fields.append("applications")

        matched.append({"model": product.get("model"), "page": record["page"], "source": record["source"], "fields": changed_fields})

    generic_intro = [p["model"] for p in products if p.get("manufacturer") == "金桥" and GENERIC_INTRO in p.get("introduction", "")]
    generic_apps = [
        p["model"]
        for p in products
        if p.get("manufacturer") == "金桥" and any(GENERIC_APPLICATION in item for item in p.get("applications", []))
    ]

    print(json.dumps({
        "manualRecords": len(records),
        "matchedJinqiaoProducts": len(matched),
        "remainingGenericIntroduction": len(generic_intro),
        "remainingGenericApplications": len(generic_apps),
        "unmatchedGenericSample": unmatched_generic[:30],
        "matchedSample": matched[:12],
    }, ensure_ascii=False, indent=2))

    if args.write:
        DATA_PATH.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()


