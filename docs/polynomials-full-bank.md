# Polynomial Level 2 demonstrations — local review

The owner approved expansion after reviewing Exercise 10D Q34(b). The app now covers all **81 numbered questions / 158 parts or table rows** in the chapter. It demonstrates the working without answer-entry or marking.

| Exercise | Numbered questions | Demonstrations |
| --- | --- | ---: |
| 10A | 21–32 | 24 |
| 10B | 19–30 | 27 |
| 10C | 20–35 | 32 |
| 10D | 26–42 | 32 |
| Revision Exercise 10 | 33–56 | 43 |

## Teaching behaviour

- Exercise and skill filters, question search, deep links, and previous/next question navigation.
- Answers initially hidden, teacher-controlled Next/Previous, Play/Pause, Replay and speed selection. Changing questions or filters cancels playback.
- Multiplication pairs are highlighted before their products appear. Sign changes precede the new line of working. Completed working remains available.
- Dedicated visuals for signed terms and degrees, vertical operations with zero placeholders, geometrical applications, and cuboid face pairs. Fractional substitutions and nonzero restrictions are preserved.
- Original question crops are available through “View source question”. Projection mode and phone layouts reuse the site controls.

## Mathematical and source checks

All expressions and final answers were independently compared with the supplied PDF. Every machine-readable equation and multiplication product is checked with exact rational polynomial arithmetic; tables, coefficient conclusions, units, ordering and dependent parts receive separate semantic review. The intermediate explanations are authored, since the textbook provides final answers rather than complete worked solutions for every question.

The focused unit suite passes **169 tests**. The wider project suite passed **1,304 tests** at the verification snapshot. All 158 source crops were inspected in seven contact sheets. Source details and review corrections are in `docs/polynomials-level2-source-audit.md`.

## Local preview and verification

Preview: <http://localhost:3007/apps/polynomials#textbook:e=10D-34b>.

The final production build, its TypeScript check, scoped ESLint and whitespace checks pass. All **21 browser scenarios pass**, including the exhaustive walkthrough of all 158 demonstrations: initial answer hiding, completion of every working line, valid mathematics rendering and a loaded source image. Navigation, timer cancellation, speed changes, keyboard, touch/reduced motion, deep links, reload, sidebar, 360/390 px phones, short landscape, desktop and projection checks also pass. The final screenshots were inspected. Independent follow-up review confirms the table and triangle teaching corrections are resolved.

The running preview uses a source snapshot in ignored `out/polynomials-full-bank/preview-final/`. This avoids interference from a separate Polynomial Quest task editing the shared workspace during verification. Its app source is the completed demonstration implementation; it links the existing dependencies and public assets. Its TypeScript configuration checks application source and excludes that other task's incomplete game files. No build errors are ignored. Tailwind scans only the copied app source. Original project configuration and environment files are unchanged.

To restart this already-built preview from PowerShell:

```powershell
Set-Location 'C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)\out\polynomials-full-bank\preview-final'
npm.cmd run start -- --port 3007
```

Evidence is retained locally in ignored `out/polynomials-full-bank/`: `content-review.md`, `app-review.md`, `focused-tests.log`, `unit-suite.log`, `final-build.log`, `final-browser.log`, `final-lint.log`, source contact sheets and browser screenshots. Source data are in `src/apps/polynomials/data/`; the snapshot is not the editing location.

This delivery is a local preview. No commit, push, production deployment, new dependency or Firebase write is part of this task.

## Publication approval and release checks (24/10/2026)

The owner requested publication after reviewing the full local bank. This release is based on production commit aa1d086954320684615a6b7e538f11e92caf7c18, retaining the published Surface Area and Similarity updates. All 17 polynomial source/data files match the reviewed snapshot by SHA-256. Only the polynomial app, its assets/tests/documentation, registry entry and copy block are added.

The complete release passes 1,306 unit tests, TypeScript, the production Turbopack build, scoped ESLint and whitespace checks. All 20 focused release browser scenarios pass. The prior exhaustive walkthrough of every completed demonstration remains valid for the identical app files. Local dependencies are linked for testing; temporary local build paths were restored before commit and are not deployed. Production uses the existing Vercel environment configuration.

Public destination: https://lskc-maths.vercel.app/apps/polynomials#textbook:e=10D-34b. Post-deployment verification is recorded locally in out/polynomials-release/.
