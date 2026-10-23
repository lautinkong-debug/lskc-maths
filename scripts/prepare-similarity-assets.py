"""Render only the requested question crops from the owner's supplied PDF.

Run scripts/export-similarity-catalogue.ts first. No network access or OCR.
The original PDFs stay in ignored tmp/similarity-source; only bounded crops ship.
"""
import json
import sys
from pathlib import Path
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[1]
scratch = root / 'tmp/similarity-source'
questions = json.loads((scratch / 'catalogue.json').read_text(encoding='utf-8'))
doc = pdfium.PdfDocument(scratch / 'textbook.pdf')
out = root / 'public/similarity/questions'
out.mkdir(parents=True, exist_ok=True)
multiplier = int(sys.argv[1]) if len(sys.argv) > 1 else 4
if not 1 <= multiplier <= 8:
    raise ValueError('Resolution multiplier must be between 1 and 8.')
# Render the native page at the requested resolution, never enlarge an old crop.
# Close each page before the next so high resolution does not accumulate RAM.
page_numbers = sorted({q['page'] for q in questions})
for page_number in page_numbers:
    page = doc[page_number - 1]
    bitmap = page.render(scale=2 * multiplier)
    im = bitmap.to_pil().convert('RGB')
    for q in (q for q in questions if q['page'] == page_number):
        left, top, right, bottom = q['crop']
        crop = im.crop((round(left*im.width), round(top*im.height), round(right*im.width), round(bottom*im.height)))
        crop.save(out / (q['id'] + '.webp'), lossless=True, method=6)
        crop.close()
    im.close()
    bitmap.close()
    page.close()
doc.close()
print(f'Rendered {len(questions)} lossless question crops from {len(page_numbers)} pages at {multiplier}x per axis.')
