"""
从《依据》文件夹内《中国陶瓷文物分类体系汇报表》主表导出 rawObjects.json。
器物图像仍由 fix_manifest_and_rename / extract_images 从《依据》内《陶瓷器物图片分类卡片版》提取。
"""
import json
import re
from pathlib import Path

from docx import Document

from yiju_paths import PROJECT_ROOT, find_baobiao_document

ROOT = PROJECT_ROOT


def find_main_object_table(doc: Document):
    """含「序号」「器物名称」「完整分类编码」列的主表。"""
    for ti, table in enumerate(doc.tables):
        if not table.rows:
            continue
        headers = [c.text.strip().replace("\n", "") for c in table.rows[0].cells]
        joined = " ".join(headers)
        if "序号" in joined and "器物名称" in joined and "完整" in joined and "编码" in joined:
            return ti, table
    raise RuntimeError("汇报表中未找到器物主表（需含序号、器物名称、完整分类编码列）")


def strip_leading_facet_codes(text: str) -> str:
    """去掉开头的 A1、C6+C13、E4+E5+E10 等分面代码前缀，保留类目说明。"""
    t = text.strip().replace("\n", " ")
    while True:
        m = re.match(r"^([A-F]\d+)(\+[A-F]\d+)*\s*", t)
        if not m:
            break
        t = t[m.end() :].strip()
    return t


def build_description(facet_cells: list[str]) -> str:
    parts = []
    for c in facet_cells:
        p = strip_leading_facet_codes(c)
        if p and p not in parts:
            parts.append(p)
    return "；".join(parts) + "。"


def main():
    path = find_baobiao_document()
    print("汇报表（依据）:", path)
    doc = Document(str(path))
    ti, table = find_main_object_table(doc)
    print("主表 index", ti, "rows", len(table.rows))

    objects = []
    for ri in range(1, len(table.rows)):
        row = table.rows[ri]
        cells = [c.text.strip().replace("\n", " ") for c in row.cells]
        if len(cells) < 10:
            print("WARN row", ri, "short cells", len(cells))
            continue
        serial_s, name, section = cells[0], cells[1], cells[2]
        code = cells[9].strip()
        if not serial_s.isdigit():
            continue
        serial = int(serial_s)
        if not name or not code.startswith("CR-"):
            continue
        # 修正文档中可能出现的 A9 -> A99（青釉编钟等）
        code = re.sub(r"-A9-B", "-A99-B", code)
        desc = build_description(cells[3:9])
        objects.append(
            {
                "id": f"obj-{serial:03d}",
                "serial": serial,
                "name": name,
                "section": section,
                "code": code,
                "description": desc,
            }
        )

    objects.sort(key=lambda x: x["serial"])
    if len(objects) != 63:
        print("WARN: expected 63 objects, got", len(objects))

    out = ROOT / "src" / "data" / "rawObjects.json"
    out.write_text(json.dumps(objects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote", out, len(objects), "records")


if __name__ == "__main__":
    main()
