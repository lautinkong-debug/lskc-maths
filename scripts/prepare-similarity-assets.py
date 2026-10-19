"""Render only the requested question crops from the owner's supplied PDF.

Run scripts/export-similarity-catalogue.ts first. No network access or OCR.
The original PDFs stay in ignored tmp/similarity-source; only bounded crops ship.
"""
import json
from pathlib import Path
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[1]
scratch = root / 'tmp/similarity-source'
questions = json.loads((scratch / 'catalogue.json').read_text(encoding='utf-8'))
doc = pdfium.PdfDocument(scratch / 'textbook.pdf')
out = root / 'public/similarity/questions'
out.mkdir(parents=True, exist_ok=True)
pages = {}
for q in questions:
    page = q['page']
    if page not in pages:
        pages[page] = doc[page-1].render(scale=2).to_pil().convert('RGB')
    im = pages[page]
    left, top, right, bottom = q['crop']
    crop = im.crop((round(left*im.width), round(top*im.height), round(right*im.width), round(bottom*im.height)))
    crop.save(out / (q['id'] + '.webp'), quality=92)
print(f'Rendered {len(questions)} question crops from {len(pages)} pages.')
