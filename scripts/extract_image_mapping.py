"""从《陶瓷器物图片分类卡片版》表格解析：器物名称 -> 原图编号"""
import json
import re
from pathlib import Path

from docx import Document

from yiju_paths import find_cards_document

path = find_cards_document()
print("docx:", path)
doc = Document(str(path))

name_to_num = {}
pat = re.compile(r"^(.+?)\s*原图序号[：:]\s*(\d+)\s*$")

for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            text = cell.text.strip().replace("\n", " ")
            if not text or "原图编号" not in text:
                continue
            m = pat.match(text)
            if m:
                name = m.group(1).strip()
                num = int(m.group(2))
                if name in name_to_num and name_to_num[name] != num:
                    print("WARN duplicate name different num", name, name_to_num[name], num)
                name_to_num[name] = num
            else:
                print("SKIP cell", repr(text[:80]))

out = Path(__file__).resolve().parent.parent / "src" / "data" / "relicImageMapByName.json"
out.write_text(json.dumps(name_to_num, ensure_ascii=False, indent=2), encoding="utf-8")
print("Wrote", out, "entries", len(name_to_num))

# Load raw object names
raw_path = Path(__file__).resolve().parent.parent / "src" / "data" / "rawObjects.js"
text = raw_path.read_text(encoding="utf-8")
import ast

# crude: extract JSON-like array - use regex for "name": "..."
names_order = re.findall(r'"name":\s*"([^"]+)"', text)
print("rawObjects count", len(names_order))

missing = []
mismatched_serial = []
for i, name in enumerate(names_order, start=1):
    num = name_to_num.get(name)
    if num is None:
        missing.append((i, name))
    elif num != i:
        mismatched_serial.append((i, name, num))

print("missing in map", len(missing))
for x in missing[:20]:
    print("  ", x)
print("serial != 原图编号", len(mismatched_serial))
for x in mismatched_serial:
    print("  ", x)
