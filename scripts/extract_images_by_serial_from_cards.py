"""
从《依据》内《陶瓷器物图片分类卡片版》按单元格提取嵌入图，序号取自单元格内「原图序号：N」，
若无该文案则回退为 Word 绘图属性 name="Picture N"（与文档内 1–63 张图一致）。
输出文件名与 relicImageFiles.json 一致（当前为 relic-001.ext 等 ASCII 名）。
"""
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
        if "relationships/image" in typ or tgt.startswith("media/"):
            out[rid] = tgt.lstrip("/")
    return out


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


def first_blip_embed(tc) -> str | None:
    for blip in tc.iter(f"{{{A_NS}}}blip"):
        e = blip.get(f"{{{R_NS}}}embed")
        if e:
            return e
    return None


def main():
    from yiju_paths import PROJECT_ROOT, find_cards_document

    base = PROJECT_ROOT
    cards = find_cards_document()
    manifest_path = base / "src" / "data" / "relicImageFiles.json"
    out_dir = base / "public" / "images" / "relics"

    manifest: list[str] = json.loads(manifest_path.read_text(encoding="utf-8"))
    # serial -> filename from manifest (1-based index)
    serial_to_name = {i + 1: manifest[i] for i in range(len(manifest))}

    z = zipfile.ZipFile(cards, "r")
    rid_map = load_rid_to_part(z)
    doc_xml = z.read("word/document.xml")
    root = etree.fromstring(doc_xml)

    serial_to_bytes_ext: dict[int, tuple[bytes, str]] = {}

    for tc in root.iter(f"{{{W_NS}}}tc"):
        text = cell_full_text(tc)
        serial = serial_from_cell(tc)
        if serial is None:
            continue
        rid = first_blip_embed(tc)
        if not rid or rid not in rid_map:
            print(f"WARN serial {serial}: no image in cell, text={text[:40]}...")
            continue
        part = rid_map[rid]
        if not part.startswith("word/"):
            part = "word/" + part.lstrip("/")
        data = z.read(part)
        ext = Path(part).suffix.lower() or ".png"
        if serial in serial_to_bytes_ext:
            print(f"WARN duplicate serial {serial}, overwriting")
        serial_to_bytes_ext[serial] = (data, ext)
        print(f"OK serial {serial} <- {part} ({len(data)} bytes)")

    z.close()

    missing = [n for n in range(1, 64) if n not in serial_to_bytes_ext]
    if missing:
        print("MISSING serials:", missing)
        raise SystemExit(1)

    out_dir.mkdir(parents=True, exist_ok=True)
    for serial in range(1, 64):
        fname = serial_to_name[serial]
        data, _ext = serial_to_bytes_ext[serial]
        dest = out_dir / fname
        dest.write_bytes(data)
        print("wrote", dest.name, len(data))

    # Optional: name map for debugging
    map_path = base / "src" / "data" / "relicImageMapByName.json"
    name_map = {}
    from docx import Document

    doc = Document(str(cards))
    pat = re.compile(r"原图序号[：:]\s*(\d+)", re.S)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                t = cell.text.strip()
                m = pat.search(t.replace("\n", ""))
                if not m:
                    continue
                # name: lines before 原图
                lines = [x.strip() for x in t.split("\n") if x.strip()]
                name = None
                for line in lines:
                    if "原图序" in line:
                        break
                    name = line
                if name:
                    name_map[name.strip()] = int(m.group(1))
    map_path.write_text(json.dumps(name_map, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote name map", map_path, "entries", len(name_map))


if __name__ == "__main__":
    main()
