"""Render only the selected textbook question crops; keep source PDF private."""
import json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
data = root / 'src/apps/polynomials/data'
out = root / 'public/polynomials/questions'
out.mkdir(parents=True, exist_ok=True)
pdf = pdfium.PdfDocument(str(root / 'out/polynomials-source/textbook.pdf'))
pages = {}
entries = []
for name in ['ab', 'c', 'd', 'rev']:
    rows = json.loads((data / f'{name}.json').read_text(encoding='utf-8'))
    for q in rows:
        if q['bank'] == '10D':
            if q['number'] <= 37:
                q['sourceRect'][3] = .03
            if q['number'] == 40: q['sourceRect'] = [.065,.329,.87,.025]
            if q['number'] == 41: q['sourceRect'] = [.065,.36,.87,.045]
            if q['id'] == '10D-42a':
                q['steps'][1]['reason'] = 'Multiply the bags per box by the candies per bag; keep (y + 1) outside.'
        if q['id'] in ['REV-54a','REV-54b']: q['sourceRect'][3] = .145
        page = q['page']
        if page not in pages: pages[page] = pdf[page-1].render(scale=3).to_pil().convert('RGB')
        image = pages[page]
        x,y,w,h=q['sourceRect']
        crop=image.crop((round(x*image.width),round(y*image.height),round((x+w)*image.width),round((y+h)*image.height)))
        crop.save(out/f"{q['id']}.webp",lossless=True)
        entries.append((q['id'],crop))
    (data / f'{name}.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Review sheets retain each full crop with a stable question identifier.
review = root / 'out/polynomials-full-bank'
for start in range(0,len(entries),24):
    selected=entries[start:start+24]
    canvas=Image.new('RGB',(1600,6*340),'#eef3f5')
    draw=ImageDraw.Draw(canvas)
    for i,(name,crop) in enumerate(selected):
        x=(i%4)*400;y=(i//4)*340
        draw.text((x+10,y+8),name,fill='black')
        crop=crop.copy();crop.thumbnail((380,295))
        canvas.paste(crop,(x+10,y+30))
    canvas.save(review/f'crop-review-{start//24+1}.jpg')
print(f'{len(entries)} source crops rendered; {len(pages)} source pages used.')
