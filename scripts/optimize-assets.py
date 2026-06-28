from pathlib import Path
from PIL import Image, ImageOps
import json


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "assets"
OUT_ROOT = ASSET_ROOT / "optimized"
MANIFEST = ROOT / "src" / "data" / "imageManifest.js"
WIDTHS = [480, 768, 1280, 1920]
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def public_path(path):
    return "/" + path.relative_to(ROOT / "public").as_posix()


def output_name(source, width):
    rel = source.relative_to(ASSET_ROOT)
    stem = "__".join(rel.with_suffix("").parts)
    return OUT_ROOT / f"{stem}-{width}.webp"


def should_skip(path):
    return OUT_ROOT in path.parents or path.suffix.lower() not in EXTENSIONS


def convert_one(source):
    with Image.open(source) as raw:
      image = ImageOps.exif_transpose(raw)
      has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)
      image = image.convert("RGBA" if has_alpha else "RGB")
      original_width, original_height = image.size
      variants = []
      for width in WIDTHS:
          if width > original_width:
              continue
          height = max(1, round(original_height * (width / original_width)))
          resized = image.resize((width, height), Image.Resampling.LANCZOS)
          out = output_name(source, width)
          out.parent.mkdir(parents=True, exist_ok=True)
          resized.save(out, "WEBP", quality=78, method=6)
          variants.append({"width": width, "src": public_path(out)})
      if not variants:
          out = output_name(source, original_width)
          out.parent.mkdir(parents=True, exist_ok=True)
          image.save(out, "WEBP", quality=80, method=6)
          variants.append({"width": original_width, "src": public_path(out)})
      return {
          "width": original_width,
          "height": original_height,
          "fallback": public_path(source),
          "variants": variants,
      }


def main():
    manifest = {}
    for source in sorted(ASSET_ROOT.rglob("*")):
        if source.is_file() and not should_skip(source):
            manifest[public_path(source)] = convert_one(source)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        "export const optimizedImages = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(json.dumps({"images": len(manifest), "variants": sum(len(item["variants"]) for item in manifest.values())}, ensure_ascii=False))


if __name__ == "__main__":
    main()
