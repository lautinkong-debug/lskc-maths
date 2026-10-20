"""Render selected question crops without the separate STFALSKC watermark.

Usage: python scripts/prepare-congruence-assets.py PDF CATALOGUE_JSON OUTPUT_DIR
The catalogue is created by scripts/export-congruence-catalogue.ts.
Coordinates use 1225 x 1617 page-pixel renderings.
The source is read-only. An intermediate PDF is saved beside it; keep both PDFs
outside public/ and version control. Native question drawing commands and the
publisher footer are preserved.
"""
import hashlib
import json
import sys
from pathlib import Path
import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter

source, catalogue, output = map(Path, sys.argv[1:4])
output.mkdir(parents=True, exist_ok=True)
questions = json.loads(catalogue.read_text(encoding="utf-8"))
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
reader = PdfReader(source)
writer = PdfWriter(clone_from=reader)
watermarks = {}
for number, page in enumerate(writer.pages, start=1):
    matching = []
    for ref in page["/Resources"].get("/XObject", {}).values():
        form = ref.get_object()
        metadata = form.get("/PieceInfo", {}).get("/ADBE_CompoundType", {})
        if form.get("/Subtype") == "/Form" and metadata.get("/Private") == "/Watermark":
            if b"(STFALSKC) Tj" not in form.get_data():
                raise ValueError(f"Unexpected watermark content on page {number}.")
            matching.append(ref)
    if len(matching) != 1:
        raise ValueError(f"Expected one STFALSKC watermark on page {number}.")
    ref = matching[0]
    watermarks[(ref.idnum, ref.generation)] = ref.get_object()

# Remove only the named, metadata-tagged Form's drawing stream. All original
# page drawing streams, images, maths, labels and the separate footer remain.
for form in watermarks.values():
    form.set_data(b"")
clean_source = source.with_name(f"{source.stem}-no-watermark.pdf")
with clean_source.open("wb") as stream:
    writer.write(stream)

# Check the saved document, not just the in-memory edit.
clean_reader = PdfReader(clean_source)
assert len(reader.pages) == len(clean_reader.pages)
for original, cleaned in zip(reader.pages, clean_reader.pages):
    assert original.get_contents().get_data() == cleaned.get_contents().get_data()
    for name, ref in original["/Resources"].get("/XObject", {}).items():
        before = ref.get_object()
        after = cleaned["/Resources"]["/XObject"][name].get_object()
        metadata = before.get("/PieceInfo", {}).get("/ADBE_CompoundType", {})
        if metadata.get("/Private") == "/Watermark":
            assert after.get_data() == b""
        else:
            assert before.get_data() == after.get_data()
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash

pdf = pdfium.PdfDocument(clean_source)
pages = {}
for question in questions:
    number = question["page"]
    if number not in pages:
        page = pdf[number - 1]
        pages[number] = page.render(scale=1225 / page.get_width()).to_pil()
    crop = question["crop"]
    image = pages[number].crop(tuple(round(v) for v in crop))
    image.save(output / f'{question["id"]}.webp', "WEBP", quality=94)
print(
    f"Prepared {len(questions)} question images without the STFALSKC watermark. "
    f"Verified all {len(reader.pages)} pages retain their other drawing streams "
    "and the original PDF is unchanged."
)
