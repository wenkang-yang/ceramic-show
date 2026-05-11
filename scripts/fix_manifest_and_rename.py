"""根据分类卡片提取时记录的真实后缀，重写 relicImageFiles.json 并重命名 relics 目录下文件。"""
import json
import re
import zipfile
from pathlib import Path

from lxml import etree

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"

SERIAL_RE = re.compile(r"原图序号[：:]\s*(\d+)")
PIC_NAME_RE = re.compile(r"Picture\s+(\d+)", re.I)


def load_rid_to_part(z: zipfile.ZipFile) -> dict:
    rels = z.read("word/_rels/document.xml.rels")
    root = etree.fromstring(rels)
    out = {}
    for rel in root:
        rid = rel.get("Id")
        tgt = rel.get("Target")
        typ = rel.get("Type", "")
        if not rid or not tgt:
            continue
        if "relationships/image" in typ or "media/" in tgt:
            out[rid] = tgt.lstrip("/")
    return out


def first_blip_embed(tc) -> str | None:
    for blip in tc.iter(f"{{{A_NS}}}blip"):
        e = blip.get(f"{{{R_NS}}}embed")
        if e:
            return e
    return None


def cell_full_text(tc) -> str:
    return "".join(tc.itertext())


def serial_from_cell(tc) -> int | None:
    m = SERIAL_RE.search(cell_full_text(tc))
    if m:
        return int(m.group(1))
    for el in tc.iter(f"{{{WP_NS}}}docPr"):
        name = el.get("name") or ""
        m2 = PIC_NAME_RE.search(name)
        if m2:
            return int(m2.group(1))
    return None


def main():
    from yiju_paths import PROJECT_ROOT, find_cards_document

    base = PROJECT_ROOT
    cards = find_cards_document()
    out_dir = base / "public" / "images" / "relics"
    manifest_path = base / "src" / "data" / "relicImageFiles.json"

    z = zipfile.ZipFile(cards, "r")
    rid_map = load_rid_to_part(z)
    root = etree.fromstring(z.read("word/document.xml"))
    z.close()

    serial_ext: dict[int, str] = {}
    for tc in root.iter(f"{{{W_NS}}}tc"):
        serial = serial_from_cell(tc)
        if serial is None:
            continue
        rid = first_blip_embed(tc)
        if not rid or rid not in rid_map:
            continue
        part = rid_map[rid]
        ext = Path(part).suffix.lower()
        if not ext:
            ext = ".png"
        serial_ext[serial] = ext

    missing_ext = [i for i in range(1, 64) if i not in serial_ext]
    if missing_ext:
        raise SystemExit(
            f"分类卡片中未找到序号与图片同格对应的条目（缺 {len(missing_ext)} 个），"
            f"例如: {missing_ext[:15]}{'...' if len(missing_ext) > 15 else ''}；"
            f"已解析序号: {sorted(serial_ext)}"
        )

    prefix = "陶瓷器物图片分类卡片版"
    new_manifest = [f"{prefix}_{i}{serial_ext[i]}" for i in range(1, 64)]

    # Remove old files in folder that won't be kept
    keep = set(new_manifest)
    for p in out_dir.iterdir():
        if p.is_file() and p.name not in keep:
            p.unlink()

    # Re-extract bytes into correct filenames (from zip again)
    z = zipfile.ZipFile(cards, "r")
    rid_map = load_rid_to_part(z)
    root = etree.fromstring(z.read("word/document.xml"))
    serial_data: dict[int, bytes] = {}
    for tc in root.iter(f"{{{W_NS}}}tc"):
        serial = serial_from_cell(tc)
        if serial is None:
            continue
        rid = first_blip_embed(tc)
        if not rid or rid not in rid_map:
            continue
        part = rid_map[rid]
        zp = "word/" + part.lstrip("/") if not part.startswith("word/") else part
        serial_data[serial] = z.read(zp)
    z.close()

    for i in range(1, 64):
        dest = out_dir / new_manifest[i - 1]
        dest.write_bytes(serial_data[i])

    manifest_path.write_text(json.dumps(new_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Updated manifest with", len(new_manifest), "files")
    for i, n in enumerate(new_manifest[:5]):
        print(" ", n)
    print(" ...")
    print(" ", new_manifest[-1])


if __name__ == "__main__":
    main()
