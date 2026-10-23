# Similarity diagram clarity

The 23/10/2026 update carries the approved Congruent Triangles interaction into Similarity Studio. The 72 source questions, printed proof steps/reasons and games remain intact.

## Source diagrams

`scripts/prepare-similarity-assets.py` renders the original PDF at scale 8 (previously 2) and saves lossless WebP crops. It processes one page at a time. Run `npx tsx scripts/export-similarity-catalogue.ts`, then the Python script; an optional argument changes the multiplier from its default of 4. The source PDF remains in ignored `tmp/similarity-source/`.

The 72 images total 4.41 MB. Q19's source crop increases from 1041 × 223 to 4164 × 892. Verify crop bounds against the native page dimensions, not by enlarging the old compressed image. The existing SVG reconstructions remain sharp at any zoom, and the teaching reference background is greyscale. The full source-question image retains its colours and givens.

## Correspondence

Only a current printed `\triangle ABC\sim\triangle DEF` statement opens the selector, including a given or recalled similarity. Vertex order determines the three side pairs and three angle pairs. A heading, polygon statement, congruence or negated similarity does not establish this correspondence.

- Navy/red identify the selected triangles; one amber pair receives attention.
- Side buttons use ↔ and show the selected ratio. No equal-length ticks or equality signs are added to corresponding sides.
- Angle buttons use =, with matching amber arcs and full angle names. Right-angle squares depend on textbook evidence, never measured tracing angles.
- Extracted marks belong to their explicitly named triangle. Shared vertices do not cause the other member to appear on the wrong copy. A moved original copy carries its highlight; the reference position loses that member's highlight.
- The current printed statement and reason stay visible. Desktop offers Sides/Angles buttons; phones and short windows use one compact selector. Earlier proof lines remain available through the existing history control.

Q19 is the pilot: A↔A, F↔B, E↔C. Side ratios are AF/AB, FE/BC and EA/CA. The selected display does not reveal a numerical scale factor before the printed calculation reaches it.

## Verification

`tests/unit/similarity-correspondence.test.ts` checks the exact mapping, rejection cases, shared-vertex ownership and all recognised statements in the bank. `tests/e2e/similarity-correspondence.spec.ts` checks one-pair focus, right angles, moved/rotated/reflected copies, the source image, and 1920×1080 / 390×844 / 844×390 layouts. Use the existing similarity browser suite for source-bank, classroom, interaction and game regression checks. Release evidence is saved under ignored `out/similarity-clarity/`.
