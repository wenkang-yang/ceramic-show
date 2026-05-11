"""Inspect 依据/中国陶瓷文物分类体系汇报表.doc structure"""
from docx import Document

from yiju_paths import find_baobiao_document

path = find_baobiao_document()
print("File:", path)
doc = Document(str(path))
for ti, table in enumerate(doc.tables):
    print(f"\n=== TABLE {ti} rows={len(table.rows)} cols={len(table.rows[0].cells) if table.rows else 0} ===")
    for ri, row in enumerate(table.rows[:25]):
        cells = [c.text.strip().replace("\n", " | ")[:80] for c in row.cells]
        print(f"  R{ri}: {cells}")
    if len(table.rows) > 25:
        print(f"  ... {len(table.rows)-25} more rows")
