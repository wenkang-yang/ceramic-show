from pathlib import Path
from docx import Document

from yiju_paths import find_cards_document

path = find_cards_document()
doc = Document(str(path))
out = Path(__file__).resolve().parent / "cells_dump.txt"
lines = []
for ti, table in enumerate(doc.tables):
    lines.append(f"=== TABLE {ti} ===")
    for ri, row in enumerate(table.rows):
        for ci, cell in enumerate(row.cells):
            t = cell.text
            lines.append(f"R{ri}C{ci}: {repr(t)}")
Path(out).write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
