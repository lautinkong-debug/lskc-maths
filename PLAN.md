# PLAN.md — LSKC Mathematics Department Website

Status legend: `[ ]` to do · `[x]` done. Work one phase at a time and stop for the owner's review at the end of each phase.

## Statistical Charts classroom layout (10/10/2026)

- [x] Replace multiplication-like removal symbols with labelled bin icons for observations and grouped classes.
- [x] Arrange the workspace in reading order: horizontal Dataset settings, Data Explorer, then Frequency distribution beside Chart type and graph.
- [x] Add a direct Table & chart view, preserve both panels in department Projection mode, and restore keyboard focus on exit.
- [x] All 45 standalone browser scenarios passed, including both panels within 1280x720 and 1920x1080, linked selection, keyboard exit and existing chart/lesson/export functions.
- [x] Next.js production build, TypeScript, ESLint and four emulator-backed department browser tests passed. Reviewed settings, bin controls and department projection screenshots.
- [x] Published implementation `3a2f90c` to both GitHub branches and production deployment `dpl_28s8JKwz9PNxtZo5U24Dwkts4whw`. Fresh signed-out Chrome checks on `https://lskc-maths.vercel.app/apps/statistical-charts` passed: vertical section order, bin deletion, linked selection, histogram/cumulative graph fit, Escape focus return, department projection and 390px phone layout. Reviewed live screenshots; no browser errors. No production Firebase data or rules changed.

## Web Apps textbook topic filter (10/10/2026)

- [x] Replace Strand filtering with all textbook topics from the same live catalogue as Mistakes Book, grouped by F1-F6 and ordered identically.
- [x] Narrow chapters by level, clear stale chapter selections when switching levels, and retain chapters without apps with an explicit empty state.
- [x] Associate apps with chapter codes, including both junior and compound inequalities; allow chapter-code searches.
- [x] Production build, TypeScript and ESLint passed. Three emulator-backed browser tests passed, including all 69 chapters, level changes, multiple chapter mappings and mobile long-title layout. Desktop/phone screenshots reviewed.
- [x] Published implementation `39157ff` through GitHub main to `https://lskc-maths.vercel.app/apps` (deployment `dpl_691PqReKUb1VhUY83DMXWEk4ru5N`). Live Chrome checks confirmed all 69 chapter names and their order match Mistakes Book exactly, chapter mappings work, level changes reset the selection, and long titles fit the phone layout. Both GitHub branches are synchronised; no production Firebase data or rules were changed.

## Statistical Charts Lab — department integration and GitHub handoff (10/10/2026)

Owner asked to include the lab in the mathematics department website, then requested a GitHub upload for later processing.

- [x] Registered in Web apps under F2 / Data Handling / 2A06, using the existing `/apps/statistical-charts` host.
- [x] Add production-build integration coverage for listing/search, navigation, projection, shared links and mobile progress restoration.
- [x] Honour the department Projection mode with reduced lab controls and a viewport-sized graph.
- [x] Exclude local environment files, generated output and test artifacts from Vercel uploads.
- [x] Prepare `docs/statistical-charts-handoff.md`, including the 21 earlier local commits absent from GitHub main.
- [x] Upload branch `codex/statistical-charts-lab` and verify remote implementation commit `e2945cd`.
- [x] Owner renamed the uploaded branch to `LSKC-Mathematics-Department-Website`.
- [x] Owner authorised updating the existing production website on 10/10/2026 after an old-main deployment restored placeholder routes.
- [x] Stage and verify the complete production website, fast-forward GitHub main, and publish to the existing Vercel domain. No Firebase database/rules changes were required.

Published at `https://lskc-maths.vercel.app` on 10/10/2026. Verified production-configured build
`dpl_2PCge2tfjdGYg4qUF1Y6ssqGH2J9` from release commit `0dd44c2`; GitHub main and the renamed branch
were fast-forwarded to that complete website. Fresh signed-out Chrome checks passed for five app cards,
F2/Data Handling navigation, percentile calculations, browser progress restoration, mobile overflow, and
69 Mistakes Book topics across F1-F6. Requests used production Firebase project `lskc-maths-2026`.
The selected Directed Numbers topic had no published books; signed-in teacher editing was not exercised.

## Statistical Charts Lab — Phase 4 (10/10/2026)

Owner requested the next phase, retaining the responsive design and rendered-output review requirement.

- [x] Percentiles, quartiles and median estimates from the displayed cumulative polygon or curve; plateau intervals and separate raw median.
- [x] Two frequency distributions with aligned classes, count/percentage scales and distinguishable series; SVG/PNG and both printed tables.
- [x] Validated local workspace restoration, tutorial/answer/construction progress, fresh-link precedence and explicit progress reset.
- [x] Local teacher activity library, instructions, starting level, delete/undo, portable links and files without student attempts.
- [x] 42 new mathematical/storage tests; 336 project unit tests and 42 Chrome browser tests passed; responsive and PDF review.
- [x] TypeScript, ESLint and Next.js production build passed; final print pagination rechecked.
- [x] Owner authorised department-site integration and GitHub handoff. Optional cloud syncing remains outside this delivery.

Review at `http://127.0.0.1:3216/`: **Grouped frequencies → 06 · Further Explorations**.
Open **My activities & progress** to author or reopen an activity. Refresh practice to verify local resumption.
The app has no student accounts or new backend writes. Full calculation, persistence and test details are in `docs/statistical-charts-lab.md`.

## Statistical Charts Lab — Phase 3 (09/10/2026)

Owner authorised Phase 3 and requested design review against international website-award standards.

- [x] Five comparison layouts with shared numeric scales, linked class selection and an explanatory reading panel.
- [x] Fixed lesson dataset, answer controls, student reset, new example and classroom presentation view.
- [x] Self-contained SVG, 2x PNG, printable charts/table and raw/frequency CSV exports.
- [x] Validated activity links and JSON file fallback; exact configuration restoration without a backend.
- [x] Responsive hierarchy, spacing, touch targets, reduced motion, print/keyboard behaviour and rendered-output review.
- [x] 31 new transport tests; 294 project unit tests and 30 browser tests passed; production build and lint checked.
- [x] Owner authorised progression to Phase 4.

Review at `http://127.0.0.1:3216/`: **Grouped frequencies → Compare Charts → All five charts**.
Open **Teacher & sharing tools** for presentation, answer control, print, CSV and portable activities.
See `docs/statistical-charts-lab.md` for the full review route, design refinements and sharing limits.
No dependencies, backend writes or public deployment were added.

## Statistical Charts Lab — Phase 2 (09/10/2026)

Owner requested the next phase and then confirmed continuation.

- [x] All five construction tutorials, progressive point/bar reveal, animated joins, curve smoothing, hints, answers and restart.
- [x] Guided calculations, partially completed graphs and independent coordinate/boundary construction.
- [x] Numerical grading with misconception-specific feedback, worked corrections, model graphs and retries.
- [x] Mouse, touch and keyboard plotting; exact numeric entry; fixed given items; dataset/level/chart reset behaviour.
- [x] 35 new unit tests, 263 passing project unit tests, 19 passing browser tests, responsive visual review, lint/typecheck/build.
- [x] Owner authorised progression to Phase 3 comparison layouts, exports, printing, sharing and dedicated teacher controls.

Review at `http://127.0.0.1:3216/` using `npm.cmd run build:statistics` then `npm.cmd run preview:statistics`.
Choose **Grouped frequencies**, then **Step-by-Step Learning** or **Practice Mode**. Try the first class mark
as 10 (midpoint feedback), then 14.5 (correct). In independent frequency-polygon practice include zero endpoints
(4.5, 0) and (54.5, 0), and choose straight segments. See `docs/statistical-charts-lab.md` for the full review route.
Curve exercises assess anchor calculations and the smoothing method, not arbitrary freehand curves. No new dependencies,
backend writes or public deployments were made.

## Statistical Charts Lab — Phase 1 (09/10/2026)

Owner supplied a full F2 Chapter 6 brief with an explicit first delivery of working Phase 1, plus the textbook PDF.

- [x] Check the textbook construction conventions visually (pp. 6.7, 6.11, 6.22, 6.27, 6.35–6.39).
- [x] Seeded generator with eight contexts, custom ranges, five distribution shapes, precision and sample-size controls.
- [x] Raw-cell/bulk/CSV input; separate grouped-frequency editor; validation and automatic full/compact frequency tables.
- [x] All five SVG charts with numeric scales, linked highlighting, safe curves and basic display controls.
- [x] Register `/apps/statistical-charts`; provide an independent static build and Firebase Hosting instructions.
- [x] 42 new numerical tests, 228 project unit tests, six browser tests, responsive screenshot review, lint/typecheck/build.
- [x] Owner authorised progression to Phase 2; classroom/export/sharing tools remain Phase 3.

Local review: `npm.cmd run build:statistics`, then `npm.cmd run preview:statistics`; open
`http://127.0.0.1:3216/` without an account. Select **Grouped frequencies**: total 20, frequencies
3/7/5/5; switch charts to inspect the extra zero endpoints and final cumulative total. Edit a value
and observe all representations update. See `docs/statistical-charts-lab.md` for the complete test route,
source conventions, implementation details and limitations. No real Firebase data or deployment was changed.

## Answers from the owner (2026-09-21)

| question | answer |
|---|---|
| Who can view the site? | **Everyone, for now** — no login needed to browse. Built as `NEXT_PUBLIC_ACCESS_MODE=public`, switchable to `school` later without code changes. |
| First admin | `t28ltk@lskc.edu.hk` |
| Teacher sign-in domain | `lskc.edu.hk` |
| School logo | Supplied. Saved to `assets/school-logo.png` (transparent), `-512.png`, `-original.jpg`. Crest colours **#DA2127 red**, **#0F4574 navy** — now the palette. |
| Topic list | Taken from the owner's `Topic.docx`. Written up in [`docs/topics.md`](docs/topics.md): 69 topics across F1–F6, with the department's own chapter codes (`1A01`, `2B07`, `Ch13`…). |
| Chinese topic names? | **No.** English only, throughout. No `nameZh` field. |
| M2? | **Not now.** The `M2` level and its strands stay in the constants, but no M2 topics are seeded and nothing is built for M2 until the owner asks. |
| Google Workspace sign-in | Not blocked — teachers can sign in with Google without IT changing anything. |

**Every planning question is answered. Nothing blocks any phase.**

Two things to keep in view rather than decide now:

- In public mode, student-edition PDFs can be downloaded by anyone on the internet who has the link, not only LSKC students. Accepted; worth a second look before the first real upload in Phase 4.
- M2 and Chinese topic names are both small, additive changes later — they are not being designed out.

## Architecture

```
Browser (Next.js app on Vercel)
  ├─ Firebase Auth ──── Google sign-in for TEACHERS only (lskc.edu.hk)
  ├─ Firestore ──────── teachers, topics, mistakeBooks, siteContent, appSettings
  └─ Cloud Storage ─── uploaded PDF / DOCX / HTML files
          ▲
   Security rules enforce every permission (access mode, role, edition, size, type)

Reading (public mode):  visitor ── no sign-in ──> topics, site content, student-edition books
Writing (always):       teacher ─ Google sign-in ─> everything, incl. teacher-edition books
```

The web apps are bundled with the site and need no backend.

## Data model

### Firestore

**`teachers/{email}`** — document ID is the lowercased email
| field | type | notes |
|---|---|---|
| name | string | display name |
| isAdmin | boolean | can manage the teacher list |
| addedBy | string | email of admin who added them |
| addedAt | timestamp | |

**`topics/{topicId}`**
| field | type | notes |
|---|---|---|
| code | string | department chapter code, e.g. `1A01`, `2B07`, `Ch13` — matches the file names teachers already use |
| name | string | English, e.g. "Quadratic Equations and Number Systems" |
| levels | string[] | subset of `F1`–`F6`, `M2` (only F1–F6 are used for now) |
| strand | string | see Strands |
| order | number | sort order within a level (follows `docs/topics.md`) |
| createdAt / updatedAt | timestamp | |

**`mistakeBooks/{bookId}`**
| field | type | notes |
|---|---|---|
| title | string | |
| description | string | short summary |
| level | string | one of the levels |
| topicId | string | ref to `topics` |
| topicName | string | denormalised for listing |
| edition | `"student"` \| `"teacher"` | controls visibility |
| fileType | `"pdf"` \| `"docx"` \| `"html"` | |
| fileName | string | original name |
| fileSize | number | bytes, ≤ 20 MB |
| storagePath | string | `mistake-books/{edition}/{bookId}/{fileName}` |
| uploadedBy | `{ uid, email, name }` | |
| createdAt / updatedAt | timestamp | |

**`siteContent/home`** — single document, teacher-editable
| field | type | notes |
|---|---|---|
| heroTitle | string | |
| intro | string | limited Markdown + KaTeX |
| announcement | `{ text, link?, active }` | banner on Home |
| updatedBy / updatedAt | string / timestamp | |

**`appSettings/{slug}`** — overrides for one Web App listing, teacher-editable
| field | type | notes |
|---|---|---|
| title | string? | overrides registry default |
| summary | string? | overrides registry default |
| featured | boolean | shown first / on Home |
| visible | boolean | `false` hides it from students |
| order | number | display order |
| updatedBy / updatedAt | string / timestamp | |

Indexes: `(edition, createdAt desc)` for "Latest uploads"; `(edition, level, topicId, createdAt desc)` for browsing.

### Constants (`src/lib/constants.ts`)

- Levels: `F1 F2 F3 F4 F5 F6 M2` — `M2` is defined but carries no topics yet; filters hide a level with no topics
- Strands (compulsory part): `number-algebra` (Number and Algebra), `measures-shape-space` (Measures, Shape and Space), `data-handling` (Data Handling)
- Strands (M2): `m2-foundation` (Foundation Knowledge), `m2-calculus` (Calculus), `m2-algebra` (Algebra)
- Upload: max 20 MB; types `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/html`

### Permissions matrix

Columns are the four kinds of user in **public mode** (the current setting).

| action | visitor (not signed in) | signed in, not a teacher | teacher | admin |
|---|---|---|---|---|
| view Home, Web Apps, Mistakes Book | ✓ | ✓ | ✓ | ✓ |
| read `topics` | ✓ | ✓ | ✓ | ✓ |
| read `siteContent`, `appSettings` | ✓ | ✓ | ✓ | ✓ |
| read student-edition books + files | ✓ | ✓ | ✓ | ✓ |
| read teacher-edition books + files | ✗ | ✗ | ✓ | ✓ |
| see apps marked hidden | ✗ | ✗ | ✓ | ✓ |
| see "Edit page" toggle and Manage menu | ✗ | ✗ | ✓ | ✓ |
| write `siteContent`, `appSettings` | ✗ | ✗ | ✓ | ✓ |
| write `topics` | ✗ | ✗ | ✓ | ✓ |
| upload / edit / delete books | ✗ | ✗ | ✓ | ✓ |
| read `teachers` | ✗ | own doc | own doc | ✓ |
| write `teachers` | ✗ | ✗ | ✗ | ✓ |

In **school mode** (`NEXT_PUBLIC_ACCESS_MODE=school`) the first column becomes all ✗ and the
second column applies only to verified accounts on an allowed domain. Nothing else changes —
the rule templates take the mode as a build-time switch, so both modes ship from the same source.

## Routes

Below, "everyone" means public mode; in school mode those rows become "signed-in school user".

| route | who | purpose |
|---|---|---|
| `/login` | everyone | Google sign-in **for teachers**; clear message if the account isn't `lskc.edu.hk` or isn't on the teacher list. Visitors never need this page. |
| `/` | everyone | Hero, two entry points, latest 5 uploads |
| `/apps` | everyone | Grid of apps, filter by level/strand, search |
| `/apps/[slug]` | everyone | One app inside PresentationFrame |
| `/mistakes-book` | everyone | Browse by level → topic (student edition; teachers also see teacher edition) |
| `/mistakes-book/[id]` | everyone / teacher | Preview (PDF/HTML) or download (DOCX); teacher-edition items require a teacher |
| `/manage/upload` | teacher | Upload form |
| `/manage/books` | teacher | Edit / delete books |
| `/manage/topics` | teacher | Add / edit / reorder topics |
| `/admin/teachers` | admin | Add / remove teachers, set admin |

---

## Phase 0 — Project setup — DONE (2026-09-21)

- [x] Create Next.js app (App Router, TS strict, Tailwind, ESLint, `src/` dir) — Next 16.3.5, React 19.2.8, Tailwind v4
- [x] Add Prettier, Vitest — **Playwright deferred to Phase 7**, where the smoke tests are actually written; installing a browser runtime now would add ~400 MB for nothing
- [x] Firebase config for Firestore, Storage, Emulators (auth 9099, firestore 8080, storage 9199, UI 4000) under the demo project ID `demo-lskc-maths`, so nothing can reach a real project
- [x] `src/lib/firebase.ts` with emulator wiring; `.env.example` and `.env.local`
- [x] npm scripts — `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `emulators`, `dev:all`, `test`. **`seed`, `rules:build` and `test:rules` are not wired yet**; they arrive with their scripts in Phases 2–3.
- [x] Crest copied into `public/`; `src/app/icon.png` + `apple-icon.png` generated from it
- [x] Git initialised (`main`), first commit made; `.gitignore` covers `.env.local`, emulator data, Playwright output

**Test:** `npm run dev:all` → site on :3000, Emulator UI on :4000. Verified: both
respond 200, all three emulators (Auth / Firestore / Storage) report ready, the page
renders with no console errors, `npm run build`, `npm run lint` and `npm run typecheck`
are all clean.

## Phase 1 — Design system, layout and Home — DONE (2026-09-21)

- [x] Tailwind v4 tokens in `src/app/globals.css` (palette, type scale, graph-paper utilities, one global focus ring, `prefers-reduced-motion`); Spectral + IBM Plex Sans via `next/font`
- [x] Design plan shown as a rendered mock-up and approved by the owner; recorded below
- [x] `SiteHeader` (crest + school name, three nav links, active state, `Sign in` placeholder, mobile menu) and `SiteFooter`
- [x] `<Math>` KaTeX component (`trust: false`, never renders user HTML)
- [x] Home: graph-paper hero with a draggable parabola, two entry cards, "Latest uploads" on stand-in rows
- [x] `PagePlaceholder` + pages for all nine remaining routes, each naming the phase that builds it
- [x] Checked at 360, 760, 900, 1440 and 1920 px; no horizontal overflow at 360 px

**Test:** `npm run dev:all`, then browse Home and click through to every page. Drag the
yellow vertex, or tab to it and use the arrow keys — the equation, vertex and roots
follow. Verified: `npm run build`, `npm run lint`, `npm run typecheck` clean; no console
errors.

## Phase 2 — Sign-in, roles and security rules — DONE (2026-09-25)

- [x] `AuthProvider` + `useAuth()` returning `{ user, role: 'visitor' | 'viewer' | 'teacher' | 'admin' }`
- [x] `/login` with Google (`hd` hint); clear message + sign-out for accounts outside `lskc.edu.hk`, and for `lskc.edu.hk` accounts not on the teacher list ("You're signed in, but you don't have teacher access yet — ask an admin.")
- [x] `<AuthGate>` honouring `NEXT_PUBLIC_ACCESS_MODE`: pass-through in `public`, login wall in `school`; `<RequireRole role="teacher">` / `"admin"` always enforced on `/manage/*` and `/admin/*`
- [x] Rule templates + `scripts/build-rules.ts` (substitutes both the access mode and the allowed domains)
- [x] `firestore.rules` and `storage.rules` implementing the permissions matrix
- [x] `/admin/teachers` page; header shows "Sign in" for visitors, account menu for teachers
- [x] `npm run seed`: admin `t28ltk@lskc.edu.hk`, a second teacher, a non-teacher `lskc.edu.hk` account (emulator accounts)
- [x] Rules tests covering Firestore and Storage permissions **in both access modes**, plus other-domain and unverified-email accounts. UI behaviour for hidden apps and the Edit toggle is tested when those features are built in Phases 5–6.

**Test:** `npm run dev:all` starts the site on :3000 and Emulator UI on :4000. In another terminal run `npm run seed` after each emulator restart. Open Home signed out: it remains readable. On `/login`, use the local test buttons for admin, teacher and viewer (password is `LocalTest123!` in the seed script); admin sees Manage and Teachers, viewer sees neither. `/admin/teachers` loads the list for admin and refuses viewer. The Web Apps and Mistakes Book content pages are still placeholders until Phases 4–5, so actual student/teacher editions cannot yet be checked in the UI. Stop `dev:all`, then run `npm run test:rules`; the command starts disposable emulators and all 14 tests should pass. Verified: `npm run build`, `npm run lint`, `npm run typecheck` and the standalone `npm run test:rules` command pass. The admin list's add/remove flow was checked against the local emulator.

## Phase 3 — Topics management — DONE (2026-09-25)

- [x] Typed helpers in `src/lib/db/topics.ts` for listing, live updates, adding, editing, guarded deletion and reordering
- [x] `/manage/topics`: add, edit, delete (blocked if books use the topic), reorder within a level
- [x] Seed script loads `docs/topics.md` (the 69 F1–F6 topics) into `topics/`

**Test:** `npm.cmd run dev:all`, then in a second PowerShell window run `npm.cmd run seed`.
The seed reports 69 topics. Open `/login`, choose the local Teacher account, then open
`/manage/topics`: F1 has 13 topics, F6 has 6. Add a temporary topic, edit its name,
move it up or down and delete it. Sign out and open `/manage/topics` directly: the
teacher-only gate refuses access. Stop `dev:all`, then run `npm.cmd run test:rules`;
the rules still reject visitor/viewer writes. Verified in the demo emulator: 69 topic
documents exist, F5 Ch18 is Measures of Dispersion, create/edit/reorder/delete work,
rerunning the seed updates existing source records without duplicating them, and
`npm run build`, `npm run lint`, `npm run typecheck` and `npm run test` pass.

## Phase 4 — Mistakes Book

- [x] Typed helpers in `src/lib/db/books.ts` (student queries always filter `edition == 'student'`)
- [x] `/manage/upload`: title, description, level, topic (filtered by level), edition, file; client-side checks for type/size; progress bar; write Firestore doc + Storage file, clean up on failure
- [x] `/manage/books`: list, edit metadata, replace file, delete (doc + file)
- [x] `/mistakes-book`: level tabs → topics → books, edition badge (teachers see both)
- [x] `/mistakes-book/[id]`: PDF via react-pdf; HTML via sandboxed `srcdoc` iframe; DOCX download via `getBlob`
- [x] Home "Latest uploads" wired to real data
- [x] Rules tests for Storage uploads (size, type, role, edition path)

**Test:** upload one of each type as teacher; view them signed out in a private window; confirm a signed-out visitor cannot open a teacher-edition link directly, even with the exact URL.

**DONE (2026-09-26):** The demo emulator check uploaded PDF and DOCX student editions and an HTML teacher edition. PDF rendering, sandboxed HTML rendering, teacher browsing of both editions, PDF replacement and metadata edit, student-only Home latest uploads, signed-out student PDF access, and direct teacher-book denial were verified in the local browser. `npm run test:rules` passed all 18 public/school mode tests. `npm run lint`, `npm run typecheck`, and `npm run build` passed. The owner should now run the Phase 4 test above with their own files, including a DOCX download and book deletion, before Phase 5.

## Phase 5 — Web Apps — DONE (2026-09-26)

- [x] `registry.ts` type + `/apps` index with level/strand filters and search
- [x] `<PresentationFrame>` + `usePresentation()`
- [x] App: **Quadratic explorer** — sliders for a, b, c; plot of y = ax² + bx + c; vertex, axis of symmetry, roots (or "no real roots" with discriminant); equation shown in KaTeX
- [x] App: **Unit circle** — drag a point around the circle; angle in degrees; live sin θ, cos θ, tan θ with projections drawn; quadrant signs
- [x] App: **Inequality number line** — enter e.g. `2x - 3 > 5` or compound `-1 ≤ x < 4`; show solving steps and the solution on a number line with open/closed dots
- [x] SVG thumbnails for each app
- [x] A short `src/apps/README.md` explaining how to add a new app

**Test:** use each app with mouse, on a phone-sized window, and in Presentation mode at 1920×1080.

**DONE (2026-09-26):** In the local demo project, the index filters and search, quadratic controls and no-real-roots case, unit-circle angle controls and undefined tangent, and inequality steps/endpoints were checked in the browser. Each app and the index fit a 360 px viewport without horizontal scrolling; the enlarged Presentation layout fit 1920×1080. The in-app browser does not expose native fullscreen, so the owner should also check the Fullscreen API in Chrome. Lint, typecheck, tests and production build pass. No real Firebase project was changed.

## Phase 6 — Teacher edit mode — DONE (2026-09-26)

- [x] Typed helpers `src/lib/db/siteContent.ts`, `src/lib/db/appSettings.ts`
- [x] Rules: `siteContent` and `appSettings` readable per the access mode, writable only by teachers; field validation (types, string lengths)
- [x] Header "Edit page" toggle, rendered only for teachers; edit state in a React context
- [x] `<EditableText>` component: dashed outline in edit mode, inline editor, Save / Cancel, "Saved" confirmation, "Last edited by … on …"
- [x] Home: hero title, intro, announcement banner editable
- [x] Web Apps index: edit title/summary, toggle featured and visible, drag to reorder; registry defaults merged with `appSettings`
- [x] Non-teachers: hidden apps filtered out of the index; `/apps/[slug]` for a hidden app shows "This app isn't available right now"
- [x] Seed default `siteContent/home`
- [x] Rules tests: write attempts to `siteContent`, `appSettings`, `topics`, `mistakeBooks` and Storage by a visitor and by a signed-in non-teacher are all rejected; teacher writes succeed

**Test:** sign in as teacher → toggle Edit page → change the Home intro and hide one app → open the site in a private window → see the new intro, no hidden app, no edit controls.

**DONE (2026-09-26):** On the demo emulator, the admin test account saved a Home introduction and announcement, changed an app listing, featured one app and reordered listings. After sign-out, the visitor view showed the saved Home content and featured app, omitted the hidden app from the index and denied its direct URL. No browser errors or warnings appeared. Rules tests passed in both public and school modes (20 tests); unit tests (8), lint, typecheck and production build passed. No real Firebase project was changed.

## Phase 7 — Polish and hardening — DONE (2026-09-26)

- [x] Accessibility pass (keyboard, focus, contrast, labels)
- [x] Empty/error states on every page
- [x] Playwright smoke tests: login gate, browse books, open an app
- [x] Lighthouse check on Home and one app

**DONE (2026-09-26):** Focus indicators now have a dark outline and yellow outer ring on light and navy surfaces; the Home graph's keyboard control exposes its numeric range. The main routes have descriptive page titles. Teacher, topic, upload, book, and featured-app loading failures show errors instead of misleading empty states. Four Chrome Playwright smoke tests pass against the local demo emulators, including mobile keyboard navigation. Lint, typecheck, unit tests and production build pass. A local production-build Lighthouse mobile audit scored Home 78 performance / 100 accessibility / 100 best practices / 100 SEO, and Quadratic Explorer 77 / 100 / 100 / 100. Lighthouse flagged unused JavaScript as the main performance opportunity. No real Firebase project was changed.

## Phase 8 — Go live

- [x] README, plain-English, step by step: create Firebase project; enable Google sign-in; upgrade to Blaze and **set a budget alert (e.g. HK$20/month) — not optional in public mode**; create Firestore + Storage; set `NEXT_PUBLIC_ACCESS_MODE` and `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`; `npm run rules:build`; deploy rules; create the first admin document `teachers/t28ltk@lskc.edu.hk` by hand; connect GitHub to App Hosting; add the App Hosting domain to Auth authorised domains (instructions prepared; live actions pending)
- [x] `apphosting.yaml` with the public env vars
- [x] `firebase.json` rules and indexes deploy config (already present and verified)
- [ ] Post-launch checklist: open the live site signed out, sign in as teacher, upload one test file, check it appears signed out, delete it
- [ ] Configure Storage bucket CORS for the site's origin so SDK `getBlob` previews and downloads work in production; verify with the post-launch test file
- [x] Dedicated project `lskc-maths-2026`: Google and Anonymous sign-in enabled; Google support email `t28ltk@lskc.edu.hk`; stable Vercel domains authorised. If switching to school mode, confirm the students' domain first.
- [ ] In **Firestore Database → Time-to-live**, create an `expireAt` TTL policy for each challenge collection group: `rooms`, `roomCodes`, `entries`, `private`, `runs`, `stats` and `classBoards`. Confirm all seven policies are enabled. TTL deletion is asynchronous, so check the school's privacy policy and the exact join-page notice in `copy.ts` before real students join.
- [x] Use **Vercel**, as requested by the owner, for Next.js and Node 24 challenge routes. Firebase Admin reads an encrypted server-only Secret backed by a dedicated `roles/datastore.user` service account.
- [ ] Complete a real teacher-created challenge through join/start/submit/delete on Vercel, after TTL and the privacy check are complete.
- [ ] Decide whether to add Firebase App Check if abuse appears; it is not required or enabled for the first classroom trial. Set the Blaze budget alert before opening public reads and challenge traffic.
- [x] Note in the README how to switch to `school` mode later (one variable, rebuild rules, redeploy)

---

## Directed numbers — Stage A (27/09/2026)

**Deployment update (06/10/2026):** `https://lskc-maths.vercel.app` is live.
Dedicated Firebase project `lskc-maths-2026`, Hong Kong Firestore, deployed rules
and ready indexes, 69 approved topics and first admin record are configured.
Google sign-in uses the requested school support email; Anonymous is enabled.
186 unit tests, lint, typecheck and the Vercel build pass. Live checks confirm
unsigned API requests fail with 401, anonymous tokens reach the server's
Firestore lookup, all 69 topics are readable, teacher records are private,
and direct student score writes are denied. The temporary test Auth user was
removed. Vercel needs `NODE_OPTIONS=--experimental-require-module` for Firebase
Admin; this is recorded in `vercel.json` alongside the Node 24 engine pin.
Storage, its CORS/rules, budget alert, and all seven TTL
policies remain pending because the project is still on Spark. Do not run a
real student challenge while the join notice's automatic deletion is pending.

- [x] Exact rational-number engine, safe parser, answer equivalence and movement helpers, with tests covering the supplied arithmetic fixtures and all 3,362 start/operation/move combinations in the lesson range.
- [x] Registered F1 app, SVG thumbnail, English copy, hash navigation and expression bookmarks. Unfinished modes explicitly show a later-stage panel.
- [x] Add & subtract: keyboard/keypad/number controls; four direction rules; teacher-paced hops and long arcs; backwards stepping; up to four chained moves; equivalent-move comparison; thermometer and lift views; worked answers with double underline.
- [x] Additional student interactions: predict direction, distance and landing; simple correction notes; Show me, retry and a similar question; change only the operation or signed number.
- [x] Projection controls and scoped clicker keys; session prediction preference; keyboard controls; reduced-motion-safe hop reveal; mobile number-line scrolling with the current point kept visible.
- [x] Final verification: lint, typecheck, all 82 unit tests and production build pass; reviewed changes are ready for the Stage A commit.

**DONE (27/09/2026):** Browser checks covered wrong direction/distance/landing feedback, a correct landing, Show me, backward/forward steps, a three-move journey ending at +4, the change-one-thing activity, keypad entry, invalid-input messages, expression bookmarks, prediction preferences surviving refresh, and later-stage placeholders. At 360 px there is no horizontal page overflow; the diagram scrolls internally and follows the current point. At 1920×1080, the enlarged lesson and controls fit, including the equivalent-move comparison with the lift view. PageDown/PageUp/R/P and ordinary keyboard buttons were checked. The final browser session reported no console errors or warnings. Hop animation has an explicit reduced-motion override. Review on an actual classroom projector remains the owner's acceptance check.

**Working checkout:** `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)` is an isolated Git worktree on `apps/directed-numbers`, created from `bee9597`. The original `C:\Users\t28ltk\Projects\lskc-maths` checkout and its untracked v2 brief remain untouched. The brief at that original checkout's `docs/codex-prompt-directed-numbers.md` is the source of requirements. No new dependencies, Firebase permissions or production services were changed in Stage A.

**Run locally:** open PowerShell in the working checkout and run `npm.cmd run dev:all`. Visit `http://localhost:3000/apps/directed-numbers`. No seed or sign-in is needed for this stage. Stop an existing copy of the development servers first if the ports are already in use. A fresh dependency installation needs `npx.cmd next typegen` before a standalone `npm.cmd run typecheck`; `next dev` and `next build` also generate those existing Next.js route types.

**Owner test (Stage A):**

1. Open Web apps and filter to F1: Directed number operations appears. Open it: Add & subtract is ready; the other modes explain that they arrive later.
2. On the default `(−3) + (+5)`, turn Predict first off and press Next five times: the point moves from −3 to +2 and the final answer is double-underlined. Back removes a hop.
3. Enter `5 − (−3)` and press Show on number line. Turn on Predict first. Choose Left: the explanation says subtraction reverses the negative addition movement. Choose Right: the distance and landing questions appear.
4. Enter `−3` for distance: feedback explains that the distance is 3 units. Enter `2` for the landing point: use Show me to see +8, then Try this step again or Try a similar question. These are learning activities without scores.
5. Turn on Same move, two ways: subtraction of −3 is paired with addition of +3. Expand Change one thing and change only the operation or number's sign; predict again.
6. Choose Lift, then Thermometer: labels and wording change to floors/up/down and temperature/rises/drops. The arithmetic stays the same.
7. Expand Use these numbers and choose the three-move journey. Step through +9, −11 and +6: the final position is +4; the 11-unit move uses one long arc.
8. Try `3 × −2` and an unmatched bracket: a clear input correction appears; the existing diagram remains intact. A valid expression can be bookmarked as `#add-subtract:e=5%20-%20(-3)`.
9. At phone width, use the mode selector and keypad. The number line can scroll inside its own box, without horizontal page scrolling. Use Tab and Enter to operate controls without a mouse.
10. On a 1920×1080 screen, enter Projection mode, focus the lesson area, then use PageDown/PageUp, R, N and P. The keypad is hidden, and arrow keys inside a typing field do not advance the lesson. The detailed student prediction forms remain in the normal view; projection is teacher paced.

**Stage boundary:** Only Add & subtract is delivered in Stage A. Number-line comparison/ordering, bracket lessons, multiplication/division, mixed working, games and challenges remain for B–G. The engine already handles fractions and mixed arithmetic, but this visual lesson deliberately accepts integer addition/subtraction within its specified bounds. Stop for the owner's review before Stage B.

**Later-stage design notes from the brief review:** Preserve time to read correction feedback; compare classes under matching question/scoring conditions; the currently specified submit API updates boards on completed runs; expiry must cover all challenge subcollections; no-time-pressure tie-breaking and division-by-zero precedence need explicit treatment. The owner's latest request hides the student's numerical rank on their phone, showing only the gap to the next place. These do not require backend work in Stage A.

## Directed numbers — Stage B (27/09/2026)

- [x] Number line: two to six movable points, keyboard sliders (arrows ±1, Shift+arrows ±5), typed values, automatic range, selected sign/magnitude/opposite, and opposite-point distance braces.
- [x] Comparing: select two points, predict < / = / >, reveal the matching explanation, including the smaller-magnitude rule for two negatives and the special case of zero.
- [x] Ordering: shuffled sets of four to six integers, ascending/descending checks, drag controls and keyboard/touch earlier/later buttons, targeted feedback, Show me and retry. Projection has a separate ordering view.
- [x] Horizontal and vertical lines, plain/thermometer/lift labels, point collision lanes, and internal phone scrolling that follows the selected point.
- [x] Brackets: tap the highlighted number or remove the next bracket, combine signs with the matching rule highlighted, predict before revealing, and step backwards/forwards at the teacher's pace.
- [x] Exact additive working for up to five terms, nested/square brackets, fractions and decimals. Decimal questions keep decimal notation in the lesson; equivalent fraction answers are still accepted. Reordering keeps each sign attached to its number.
- [x] Sign-then-size explanations and gain/loss bars, targeted wrong-sign/wrong-size hints, Show me, and hidden discussion answers. Invalid inputs preserve the current demonstration.
- [x] Lazy-loaded modes, expression bookmarks, explicit mode/history synchronisation, scoped clicker keys, session prediction preference, and English copy in `copy.ts`.

**Working checkout:** `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)`, branch `apps/directed-numbers`. Stage B adds no dependencies or Firebase access. Number-line exploration uses integer points from −100 to +100; arrow keys move by whole units. The bracket lesson supports exact rational values within the arithmetic engine's safe limits. Multiplication/division remain Stage C.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`. Open `http://localhost:3000/apps/directed-numbers#number-line`. No sign-in or seed is needed. If the local servers are already running, use the existing preview.

**Owner test (Stage B):**

1. Open **Number line**. A is −4 and B is −2. Turn Predict first on and choose >: read the correction. Choose <: the explanation says that −2 is further right and has the smaller magnitude.
2. Select A and enable **Show opposites**: its opposite is +4 and both distances are 4. Focus A and press Right, then Shift+Right: its value becomes +2. Set it to 0 to see that zero is neither positive nor negative and is its own opposite.
3. Add points until six are present, drag one, then remove it. Switch Appearance to **Lift**, then **Thermometer**: the labels change and greater numbers are higher. Try −100 or +100 using the value field; the range expands.
4. In **Put the numbers in order**, check the initial shuffled set. Read the hint, then move the chips using their arrows or drag them. **Show me the order** reveals −8 < −2 < 0 < +3. Change to six numbers and descending order, then retry.
5. Open **Brackets**. On `(+2) + (−3) − (−8)`, remove the first bracket. With Predict first on, choose + for `+ (−3)`: read the correction, then choose −. Continue to see `2 − 3 + 8`, then −1 + 8, then the double-underlined 7.
6. Enter `−3/2 + [4 + (−5)]`. Step through: the square bracket becomes −1 before the outer addition is simplified, and the answer is −5/2. Enter −2.5 or −2 1/2 in the answer field: either is accepted. A +2.5 answer gets the specific sign hint.
7. Enter `(−1) − (+3.8) − (−1.5)`. Show me gives −3.3, with gains 1.5 and losses 4.8. **Reorder the signed terms** keeps the same total. Try `3 × 2` or an unmatched bracket: a clear input message appears without replacing the lesson.
8. At phone width, switch modes with the selector and enter `5 − (−3)` using the keypad. Check that the page has no horizontal overflow and that the diagrams scroll within their own panels.
9. In Projection mode at 1920×1080, use **Explore points** / **Put the numbers in order**. In Brackets, focus the lesson area and use PageDown, PageUp, R, N and P. Typing in a field must not advance the lesson; controls and the latest working should remain visible.
10. Switch modes, use browser Back/Forward, and open a bookmark such as `#brackets:e=%E2%88%923%2F2%20%2B%20%5B4%20%2B%20(%E2%88%925)%5D`. The correct lesson and expression should load.

**Verification (passed):** All 128 unit tests, lint, typecheck, production build and `git diff --check`. Unit tests include step-by-step equality, all four sign combinations, left-to-right working, nested brackets, exact decimals, equivalent fractions, zero, unsafe intermediate totals, rendered highlight spans, ordering and range helpers. Browser review covers phone and projection layouts, keyboard point movement and clicker keys, pointer dragging, sign correction, exact answer entry, keypad input, expression bookmarks, mode changes and browser history. At 360 px, the document width is 345 px with no horizontal page overflow. At 1920×1080, the point controls, ordering controls and bracket input fit in the viewport; the working panel follows its latest line. The final browser check reported no console warnings or errors. Classroom-projector acceptance remains the owner's check.

**Stage boundary:** Stage B completes Number line and Brackets only. Stop for review before Stage C.

**Owner-requested bird method for Add & subtract (27/09/2026):** The [linked number-line video](https://www.youtube.com/watch?v=DBSviXhkubg&t=1s) inspired the bird visual. The owner's clarified teaching rule is: place the bird at the first number facing right; read the operation sign, then the second number's sign; turn around once for each minus sign; finally walk forwards by the second number's magnitude. The first number's sign only locates the starting point. Thus `(+3) − (−5)` turns right → left → right and moves forwards to `+8`. The original SVG bird turns on the teacher-paced number line one sign at a time, while Predict first asks students where it faces after each sign and gives specific correction notes. The lesson includes `+3 + (−7) = −4`, `−2 − (−4) = +2`, and `+3 − (−5) = +8`. Zero has a stay-put explanation. The original direction table, thermometer and lift remain available.

**Quick review of the bird method:** Open `http://localhost:3000/apps/directed-numbers#add-subtract`. Choose **+3 − (−5)** in **Follow the bird**. The bird starts at +3 facing right. Use **Read the operation sign** to turn it left, then **Read the second sign** to turn it right again; **Next** walks it forwards to +8. Turn on **Predict first** and retry: answer each facing question, including a wrong answer, to check the correction text. Try **+3 + (−7)** for one turn left and seven forwards steps to −4; **−2 − (−4)** starts facing right at −2 despite its negative first number and ends at +2. Try `(+4) + (0)` for no movement. On a phone, the page should fit at 360 px with the line scrolling inside its own box; in projection mode the step controls should remain visible at 1920×1080.

**Verification of clarified turn rule:** 135 unit tests, lint, typecheck, production build, and `git diff --check` pass. Browser review confirmed right → left → right and the final `+8` for `(+3) − (−5)`, the specific correction after each wrong facing choice, the one-turn `+3 + (−7)` explanation, a negative starting point, and the zero case. At 360 px there is no page-wide horizontal overflow; at 1920×1080 the projection controls fit after removing duplicate guide controls.

## Directed numbers — Stage C (27/09/2026)

- [x] × and ÷ **Pattern**: extend a fixed-factor table and column chart through zero; students predict the first negative multiplier's product and receive a change-per-row hint.
- [x] **Repeated addition**: adjustable negative hop size and 0–8 equal leftward hops, with one hop per click and cumulative working.
- [x] **Sign rules**: the four sign pairs for × or ÷, with a highlighted pair, sign-then-magnitude working, exact fraction answers, wrong-sign/wrong-size hints, and a clear division-by-zero message.
- [x] **Many factors**: build 2–6 factors joined by × or ÷, count negative signs, handle zero, show a reciprocal when dividing by a fraction, and reveal exact working one line at a time. A custom ×÷ expression is available outside projection mode.
- [x] **Mixed operations**: eight worked examples and custom input; choose the next operation, then reveal one line at a time. Innermost brackets, ×÷ before +−, left-to-right within a level, mixed-to-improper conversion, reciprocal division, exact fractions, written decimal notation until calculation, optional sign working and decimal form, and final-answer feedback are supported.
- [x] Full-arithmetic working engine and textbook fixtures, including printed minus signs and keyboard hyphens. Existing additive Brackets working remains intact.

**Working checkout:** `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)`, branch `apps/directed-numbers`. This stage changes only the directed-numbers app, English copy, and this plan. It adds no dependencies or Firebase access.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`, then visit `http://localhost:3000/apps/directed-numbers#multiply-divide`. No sign-in or seed is needed. Reuse the local servers if they are already running.

**Owner test (Stage C):**

1. In **× and ÷ → Pattern**, keep +5 and advance to `+5 × 0 = 0`. Predict `+5 × (−1)` incorrectly as +5; read the −5-per-row correction. Enter −5 and continue to −4. Change the fixed factor to −3 and watch the pattern cross zero in the other direction.
2. In **Repeated addition**, use size 3 and count 4. Press Next hop four times: the marker should land at −3, −6, −9 and −12, with one more `−3` in the sum each time. Set the count to 0 and check the stay-at-zero explanation.
3. In **Sign rules**, try `−6 × +3` with +18: the feedback should say the size is right but the sign is wrong. Reveal −18. Switch to `−6 ÷ +3`, then test same-sign examples. Set the second number to 0 for the division-by-zero message; try a fractional quotient.
4. In **Many factors**, use the initial `−2 × +3 ÷ −4`: two negative signs give a positive result; step through to +3/2. Add factors up to six, change one sign and observe odd/even parity, then try 0 and a zero divisor. Enter `(+6) ÷ (−3/5) × (+5)` as a custom expression and inspect the reciprocal and exact working.
5. Open **Mixed**. For `(+4) + (+3) × (−2)`, choose addition first to see the order correction. Choose multiplication and step to −2. Turn on **Show sign working** and repeat to see the sign before the magnitude calculation.
6. Choose the bracket example `[(+5) − (−4)] × (−2)` and the mixed-number example `(−2 1/4) ÷ (+3/2) + (+1)`. Check that brackets and mixed-to-improper conversion appear before the remaining arithmetic. Try a wrong final sign in the answer field.
7. Enter `12/(5 + (−8)) − (−3)` and `[(−15) + (+7) × (−2)] / [(−3)(+2) + 1]`; use Back, Next and Show me. Try invalid input or division by zero: the current lesson should stay in place with a clear message.
8. At 360 px, switch panels and modes using the phone controls; the page should have no horizontal overflow. At 1920×1080, turn on Projection mode and check that the Mixed step controls and Many-factors step controls remain visible. Try an expression bookmark such as `#mixed:e=%28%2B4%29%20%2B%20%28%2B3%29%20%C3%97%20%28%E2%88%922%29`.

**Verification (passed):** 166 unit tests, typecheck, lint without warnings, production build, and `git diff --check`. Browser review covered the zero-crossing prediction and correction, leftward SVG hop, sign-rule correction and reveal, factor-chain sign and reciprocal working, mixed-order wrong-choice correction, 360 px phone width without document overflow, 1920×1080 projector controls, and no browser-console warnings or errors. Classroom-projector acceptance remains the owner's check.

**Stage boundary:** Stage C completes × and ÷ and Mixed only. Stop for review before Stage D.

## Directed numbers — Stage D: Play framework (28/09/2026)

**Built:** Play hub with six open worlds, three levels per world, 54 possible stars, XP, six rank titles, avatar frames and device-only progress/settings. Worlds 1 and 5 use the shared Run format, with first-operation choices in mixed questions, short mistake feedback, answer review and links back to the matching Learn mode. Challenge Run uses an eight-character set code that reproduces the same questions. The ten-question daily set uses the Hong Kong date and tracks a streak. Lift Rush has a 16-floor tower, floor-by-floor movement, keyboard controls and a 12-passenger Relaxed option. Pure generators, 11 misconception patterns, nickname/code helpers and directed scoring are ready for the later server challenge stage. No Firebase schema, rules or packages changed.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`, then visit `http://localhost:3000/apps/directed-numbers#play`. No sign-in or seed is needed. The local Firebase emulators are needed for the site's app-availability check, but Play progress stays on this device.

**Owner test (Stage D):**

1. Open **Play ★**. Check six worlds and three level buttons in each. Every level should open; World 1 should be recommended at first. The header shows 0 of 54 stars and the Novice rank on a fresh device.
2. Start **Number Line Town → Level 1**. Answer a comparison, an ordering question and the marked line. Choose a wrong comparison sign once: read the short number-line hint and use **Show me** to open the Learn mode.
3. Start **Order Castle → Level 1**. Choose **Add first** for a sum that includes multiplication, then enter the correct final number. The answer is still marked wrong because the first step matters; the feedback says to multiply first. Try another question with the correct first step and press Enter in the answer box.
4. Finish a Run and inspect the directed-number score expression, stars, XP and **Review answers**. Try **Next level**. Progress should remain after a reload, and a replay should keep the higher star count and personal-best score.
5. Open **Challenge Run**, select five questions and make a set code. Copy the eight characters, finish or leave the run, then enter the same code. The questions should be identical and in the same order. Enter a code containing `O` for the validation message.
6. Open **Today's challenge**. It should contain ten mixed questions; after completion, the hub says today's challenge is complete and shows the streak. Another device on the same Hong Kong date gets the same questions.
7. Start **Lift Rush → Level 1**. For a passenger sum, tap the destination floor from B5 through G to 10/F. Also focus the game and use ↑, ↓ and Enter. A wrong floor should reveal the correct destination with a short explanation. Let the 60-second run end and inspect the stars and score.
8. Open **Settings**. Change nickname, avatar and frame; turn on **Relaxed mode** and play Lift Rush again. It should use 12 passengers without a timer. Reset progress only if you want to erase this device's test stars and XP.
9. At 360 px, try the map, Run and Lift Rush without horizontal page scrolling. At 1920×1080, enable Projection mode and check the question, controls and feedback from the back of the room. Repeat a Run and Lift Rush using only the keyboard.

**Verification (passed):** 182 unit tests, typecheck, lint without warnings, production build and mobile/projector browser checks. In the browser, the 360 px map, Lift Rush and Order Castle had no document overflow; the 1920×1080 Lift Rush controls fit the viewport. Arrow keys plus Enter reached the correct Lift floor, and keyboard selection plus Enter submitted a correct Order Castle answer. A wrong first-operation choice displayed the correction; a five-question coded Run reached the score/review screen. Classroom-projector acceptance and use on student phones remain the owner's checks.

**Known limitations:** Sign Snap, Target Hop, Red Pen Hero and the full 15-stamp book are Stage E; optional sound/vibration and Relaxed mode still need checks in those games. Class challenge persistence, teacher controls and leaderboards are Stages F–G. On a new device, progress starts afresh because it is local storage, not a student account.

**Stage boundary:** Stage D stops here for owner review. Build Stage E only after approval.

## Directed numbers — Stage E: games and rewards (28/09/2026)

**Built:** Sign Snap now uses sign cards for × and ÷, left/right/down keyboard controls, swipe, an occasional zero card, a 45-second timed round with faster correct-card pacing, and exact-value boss cards. Target Hop has ten solvable puzzles per level, an animated −12 to +12 line, reusable-card prevention, Undo, a shortest-route hint and per-puzzle stars. Red Pen Hero has four ordinary pages and a two-mistake boss page per level, with one clean page, three red pens, reason choices and corrected working. The 15-stamp book shows conditions for locked stamps and awards new stamps from saved device progress; new stamp inks unlock with ranks and a certificate appears on collecting all 54 stars. Game feedback uses short, specific sign and operation explanations. Optional sound, vibration and Relaxed mode are wired into the new timed game, and reduced-motion settings reach the shared game effects. Firebase and packages are unchanged.

**Run locally:** in this checkout run `npm.cmd run dev:all`, then open `http://localhost:3000/apps/directed-numbers#play`. If those servers are already running, open the URL directly. The local Firebase emulators provide the site's app-availability check; Play progress is stored only in this browser.

**Owner test (Stage E):**

1. Open **Play ★**. Select **Sign Snap → Level 1**. On a negative card, swipe left or focus the game and press ←; use → for positive and ↓ or 0 for zero. Check that the card moves towards the matching side of the line and a wrong choice explains the sign in simple terms.
2. Let a Sign Snap round end. Check its score expression, stars and XP. In **Settings**, turn on **Relaxed mode** and replay: 12 cards replace the timer. Try Level 3 and enter the exact value on a fifth-card bonus question.
3. Select **Hop Island → Level 1**. Use the move cards to reach the flag, press **Undo**, then try **Hint**. Check the avatar moves along the number line, used cards cannot be replayed, and a shortest route earns three puzzle stars. Try **Show solution** on another puzzle.
4. Select **Red Pen HQ → Level 1**. Tap a wrong line and choose its reason; read the corrected line beneath it. Tap a correct line on another page and check that one red pen is used. Page 2 should accept **All correct!**, and page 5 should ask for two mistakes.
5. Open **Stamp book**. Check all 15 names and conditions. Earn a world-level result and verify the new stamp appears; reload and check it remains. Rank up to see additional stamp-ink choices in Settings.
6. With sound and vibration off, then on, compare game feedback. Enable **Reduce motion** and check that card movement, stars and confetti stop animating. Vibration requires a device and browser that support it.
7. At 360 px, check Sign Snap, Target Hop, Red Pen Hero and the stamp book for page-wide horizontal scrolling. At 1920×1080, enable **Projection mode** and check the working and controls from classroom viewing distance. Try each game using only the keyboard (Tab, Enter or Space; Sign Snap also uses arrow keys).

**Verification (passed):** 186 unit tests, typecheck, lint and production build. Live browser checks at 360 px found no page-wide horizontal scroll in the hub, Sign Snap, Target Hop, Red Pen Hero or the stamp book; a Sign Snap arrow-key answer, a shortest Target Hop route, and a Red Pen correction were exercised. Sign Snap's Relaxed mode showed 12 cards and no timer. Red Pen Hero also worked with keyboard Enter and fit a 1920×1080 projection view with no horizontal scroll. Browser console reported no errors or warnings.

**Known limitations:** The three class-related stamp conditions will unlock only when Stage G connects class challenge results. Progress remains local to one browser/device. The owner's classroom projection, sound and phone-vibration checks are still needed.

**Stage boundary:** Stage E stops here for owner review. Stage F needs separate approval.

## Directed numbers — Stage F: challenge backend (28/09/2026)

**Built:** Firebase Admin verifies student ID tokens and re-marks every answer in Node API routes. Join, start and submit use server transactions; the server measures time, limits attempts and starts, keeps optional class numbers in a teacher-only collection, updates question stats and class averages, and returns the student's rank. Teachers can close, extend or delete rooms; closing and extending align existing child records' 60-day expiry dates. Firestore rules keep every score write server-only and prohibit listing join codes. Anonymous Firebase users appear as visitors without an account menu. The local seed adds a lobby room with code `MATH23` and five generated players. The 15-question set-code option keeps old codes compatible. The exact join-page privacy wording is ready in `copy.ts` for Stage G.

**Run locally:** in this checkout run `npm.cmd run dev:all`. In another PowerShell window run `npm.cmd run seed`, then open `http://localhost:3000/apps/directed-numbers#play` and `http://127.0.0.1:4000/firestore`. The local Firebase project must be `demo-lskc-maths`. The challenge join and leaderboard pages arrive in Stage G, so the Stage F owner check uses the emulator and existing Play page.

**Owner test (Stage F):**

1. Open **Play ★**. The six worlds and games should still open. **Join a class challenge** remains disabled until Stage G.
2. Open the **Firebase Emulator UI → Firestore → rooms → demoDirectedNumbers01**. Check that the code is `MATH23`, status is `lobby`, playerCount is 5 and the setting uses five questions.
3. Open **entries** under that room. Check that the five players have generated nicknames and avatars, with no student emails or real names.
4. Open **private** under the same room. Check that class numbers are separate from the public entries. The rules tests verify that students cannot read this collection.
5. Open **roomCodes → MATH23**. It should point to `demoDirectedNumbers01` and show an expiry date 60 days after the room's scheduled close.
6. At a 360 px browser width, reopen Play and a game; check for page-wide horizontal scrolling. At 1920×1080, turn on **Projection mode** and use Tab and Enter to open a game and answer a question.
7. Stop `dev:all`, then run `npm.cmd run test:rules` and `npm.cmd run test:challenges`. Expect 24 rules tests and six challenge tests to pass, including denied score writes, replay rejection, server re-marking and expiry alignment.

**Verification (passed):** 186 unit tests, 24 public/school rules tests, six emulator challenge tests, lint, typecheck, production build and `git diff --check`. A local anonymous Auth token joined `MATH23` through the HTTP API as `Swift Fox 2`; Start correctly refused the lobby room. The Play page had no horizontal overflow at 360 px or 1920×1080. In projection mode, keyboard Enter opened Red Pen Hero, selected the wrong line and chose a reason; the correction appeared. A browser-injected `data-pdffiller-skip` attribute produced one hydration warning in the in-app browser; the warning points to that injected attribute, not an app component.

**Known limitations:** Stage G adds the teacher and student pages, live boards, QR codes and an end-to-end two-window test. Before real students use them, enable Firebase Anonymous sign-in and Firestore TTL policies for `expireAt` on room, code, entry, private, run, stats and class-board collection groups, and compare the join-page notice with the school's data-privacy policy. No real Firebase project was changed. The numeric rank key resolves elapsed time to 10 ms and submission order into one million intervals across the room's open period; very close submissions can share a rank. The classroom projector and student-phone check remain for the owner.

**Stage boundary:** Stage F stops here for owner review. Stage G needs separate approval.

## Directed numbers — Stage G: challenge experience and boards (28/09/2026)

**Built:** Teachers can create and list live or homework challenges, project a lobby code and QR code, follow a live top-10 board, reveal the podium one place at a time, inspect a per-question accuracy chart with **Show me** links, and see class numbers in a teacher-only result table. Students can join with a generated nickname and avatar, wait for the teacher, complete a server-marked run, see their directed-number score and gap to the next place, and review their answers. A run and result survive a page refresh in the same tab. `/boards` shows seasonal class averages after five players. The Play hub and site header link to these routes. The teacher form offers one-tap Gentle scoring, No timer and Avatars only presets.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`. In a second PowerShell window in the same checkout, run `npm.cmd run seed`. Keep the first window open while testing. All challenge data is in the local `demo-lskc-maths` emulators.

**Owner test (Stage G):**

1. Open two browser windows, one signed in as the seeded teacher and one private window as a student, and join room `MATH23`. In the teacher window, go to `http://localhost:3000/login` and choose the **Teacher** local-test button; the student window needs no sign-in.
2. In the teacher window open `http://localhost:3000/challenges/demoDirectedNumbers01`. Check that the lobby shows `MATH23`, a QR code, five demo avatars, and the new student's avatar after joining.
3. In the private window open `http://localhost:3000/join`, enter `MATH23`, choose a generated nickname and avatar, and click **Join challenge**. Check the privacy notice and waiting screen; only the teacher should see an optional class number.
4. Back in the teacher window click **Start**. The student should see **Start my questions**, a 3–2–1 countdown, then five questions. Answer or skip them, and refresh once during the run: it should return to the same question.
5. Finish the student run. Check the score expression, personal-best stamp, gap to the next place and **Review answers**; wrong answers show a correction and **Show me**. Refresh the result page and confirm it remains visible. The phone should not show how far the student is from first place.
6. In the teacher window, check the live board shows the student's server-marked score and no ranks below 10th. Click **End now**, then **Reveal next podium place** until all finishers are shown (once if only one student finished). Check the podium, accuracy bars, and a **Show me** link that opens the matching Learn mode.
7. Open **Teacher details** to see class numbers privately, then open `http://localhost:3000/boards`. A class needs five completed players before it appears; check that classes are sorted by average score, not total score.
8. Open `http://localhost:3000/challenges/new?app=directed-numbers`, try the **Gentle scoring**, **No timer** and **Avatars only** presets, and create a fresh room. Check the new code and QR code. At 360 px there should be no horizontal page scrolling; at 1920×1080 the lobby, live board and podium should be readable from the back of the classroom. Use Tab and Enter to operate the form and main controls.

**Verification (passed):** Lint, typecheck, 186 unit tests, production build, 24 rules tests, six challenge backend tests, five Playwright browser tests, and `git diff --check`. The new browser test uses separate teacher and anonymous-student contexts; it checks room creation, joining, refresh during a run, refresh after results, and a score on the teacher board. Manual browser checks found no page-wide overflow at 360 px on Join and the teacher form; the lobby QR and avatars rendered at 1920×1080. Production-build Lighthouse mobile scores were `/join`: 51 performance / 100 accessibility / 100 best practices / 100 SEO, and the directed-numbers app: 65 / 100 / 100 / 100. Lighthouse warned that this local device's CPU is slower than its expected calibration; unused JavaScript and main-thread work remain performance opportunities.

**Known limitations:** The school's data-privacy policy has not been provided for comparison with the join-page notice. Real Firebase still needs Anonymous sign-in and seven Firestore TTL policies before students use the boards. The owner should verify actual phones, classroom projector legibility, QR scanning and the school's Google domain if school-only mode is planned. No real Firebase project was changed. Progress and avatar frames remain local to one browser/device.

**Stage boundary:** Stage G completes the seven-stage directed-numbers brief. Stop for owner review; do not deploy or change real Firebase without a separate request.

## Directed numbers — design refinement (02/10/2026)

**Built:** Learn, Play and Compete now have distinct primary navigation, with lesson navigation beneath Learn. Number Line Quest has a clearer profile and XP panel, daily challenge, six individually illustrated world cards, aligned level controls, and a keyboard-accessible shortcut to the map. The palette remains the school's navy, paper, pencil and yellow highlighter; the six landmarks are original lightweight SVGs. Hover movement respects the device and game reduced-motion settings.

The join page explains the three steps before a large code field; loading and disabled states are visible, and successful code lookup moves focus to the challenge heading. Nickname controls wrap on narrow phones. Teacher presets show their selected state. Class-average labels remain legible over every bar, including zero and negative scores. A compact live join strip leaves room for ten ranks in two columns on large displays; rank movement accounts for both horizontal and vertical changes. The podium puts first place in the centre, with distinct heights and medal-colour rules.

**Review and iteration:** Checked the layout at 360, 768, 1440 and 1920 pixels. Reduced the mobile introduction, added the direct map shortcut, corrected nickname wrapping and button alignment, and fixed the shared header overflowing at tablet widths when a teacher is signed in. The tablet now uses the expandable menu. Original design references were the [Awwwards evaluation criteria](https://www.awwwards.com/about-evaluation/) and [Webby judging criteria](https://www.webbyawards.com/judging-criteria/): visual clarity, usability, audience-appropriate interaction and coherent overall experience. This is a design benchmark, not an award or score claim.

**Verification:** Lint, TypeScript, 186 unit tests and the production build passed. Browser inspection confirmed no page-wide horizontal overflow on the checked phone/tablet views, keyboard access to the map and a game, reduced-motion behaviour, readable positive/zero/negative class averages, the live top ten fitting a 1920×1080 viewport, and the staged podium reveal. The bird example `(+3) − (−5)` still turns left at the first minus and back to the right at the second minus. No browser errors or warnings were reported in the inspected session. All five Playwright end-to-end tests, 24 security-rules tests and six challenge backend tests also passed; `git diff --check` is clean. The existing two-window test exercised teacher room creation, anonymous joining, refresh recovery, server marking, the live board and podium reveal after the design changes.

**Owner test:** Run `npm.cmd run dev:all` in this checkout and `npm.cmd run seed` in a second PowerShell window. Open `http://localhost:3000/apps/directed-numbers#play`. Try **Choose a world**, a level, **Settings → Reduce motion**, and **Learn**. Resize to a phone and tablet width and check the menu, spacing and touch targets. Open `/join`, enter `MATH23`, and follow the nickname form. For the teacher flow, sign in at `/login` using a local test account, then use `/challenges/demoDirectedNumbers01` and the Stage G two-window test above. Class averages require five completed players. Check the final appearance on the actual classroom projector and student phones.

**Scope:** Local design and interaction refinement only. No new packages, production data changes or deployment. The temporary populated-board fixtures were confined to the demo emulator. Stage G's launch and privacy checks remain applicable.

## Decision log

- 2026-10-09: Statistical Charts Phase 3 keeps classroom controls local and unauthenticated. Shared activities use a validated
  versioned URL fragment (8,000-character limit) or JSON file fallback (250 KB). Only the active data source is exported;
  practice attempts and personal-name fields are not stored. Comparisons share numeric domains, including print/export.
  Award-site references inform visual QA while preserving the LSKC exercise-book design. No public deployment is implied.

- 09/10/2026 — Owner requested Statistical Charts Lab Phase 2. Keep all activities tied to the active data; grade mathematical coordinates and histogram extents, reject the wrong join method, and show misconception-specific correction/retry routes. Curve practice constructs and smooths polygon anchors; freehand curve grading and manual axis design are not claimed. Browser tests use a fresh isolated local server on port 3217.

- 09/10/2026 — Statistical Charts Lab follows the owner's supplied brief: deliver tested Phase 1 first. Use a pure shared calculation module and numerical SVG rendering, keep the department palette, and add a backend-free static build. All classes use lower-inclusive/upper-exclusive boundaries for consistent less-than cumulative frequencies; automatic fitting covers the maximum. Later-phase features are explicitly deferred.

- 02/10/2026 — The owner requested an iterative visual-quality review. Retain the exercise-book identity and calm Learn screens, give the six Play worlds distinct illustrated landmarks, and improve navigation and competition readability. Use a collapsed shared menu below 1280 px to accommodate all teacher links without page overflow.

- 28/09/2026 — Stage G keeps the student's phone focused on the gap to the next place, following the owner's explicit request; the teacher board shows at most the top 10. Correct-answer review uses the same pure grader as the server, so equivalent answers do not get an unnecessary correction. The class board offers the current and previous five school terms.
- 28/09/2026 — Challenge result and in-progress question state are held in per-tab `sessionStorage` so a refresh returns to the same point; the server remains authoritative for the run and score. Phase 8 must enable Anonymous Authentication, the seven `expireAt` TTL policies, and App Hosting Node routes with Admin default credentials. App Check remains a later abuse-control option.
- 28/09/2026 — Stage F challenge scores are re-marked on the server and browser-supplied scores and timings are ignored. A student can still calculate answers outside the app or inspect generated questions in developer tools; this is acceptable for class practice. App Check remains an option if abuse appears. The 60-day privacy promise requires launch-time Firestore TTL policies, and early closing or extending a room updates every existing child document's expiry.
- 27/09/2026 — Directed numbers Stage B: preserve decimal notation for decimal-only bracket questions, retain exact fractions internally, and give the ordering activity its own projection view so all six chips stay visible. Point exploration stays on integer positions; fractions and decimals are available in Brackets. Native history updates keep mode links and browser Back/Forward in sync without reloading the lesson shell.

- Hosting: Firebase App Hosting (one platform with Auth/Firestore/Storage). Requires Blaze plan.
- UI language: English only — no Chinese topic names (owner's decision, 2026-09-21). Re-addable later as one optional field.
- M2 deferred: the level and strands exist in the constants, but nothing is seeded or built for M2 until asked.
- **Access: public for now.** The owner asked that anyone be able to view the site. Reading is open to the internet for topics, site content, app listings and student-edition books; teacher-edition material and every write still require a teacher sign-in. Built as a build-time switch (`NEXT_PUBLIC_ACCESS_MODE`) so it can be closed to `lskc.edu.hk` later without touching page code. A Blaze budget alert is required at launch because public read means public egress.
- Palette taken from the school crest (#DA2127 red, #0F4574 navy) rather than invented colours; the exercise-book theme is rendered in those.
- Topic codes (`1A01`, `2B07`, `Ch13`) are stored on each topic, so the site matches the file names the department already uses. Senior forms share one Ch0–Ch31 sequence across F4–F6.
- Phase 2 (2026-09-25): Teacher status requires a verified email on an allowed domain **and** `teachers/{lowercased email}`; `isAdmin` on that document grants admin status. The first admin is seeded only in the demo emulator. In a real project the first admin document must be created manually during Phase 8.
- Phase 2 (2026-09-25): `npm run rules:build` validates the mode/domains from `.env.local` and generates both rules files. The tests render the same templates in `public` and `school` modes. Storage denies file listing, limits writes to teacher accounts, approved types and 20 MB, and reads teacher editions only for teachers.
- Phase 2 (2026-09-25): The login page offers password-based **local emulator test buttons** for three seeded, verified accounts; normal sign-in uses Google. `npm run seed` hard-stops unless emulator mode and the `demo-lskc-maths` project ID are set. The seeded viewer has no teacher document. An admin cannot remove or demote their own account in the UI or rules.
- Phase 3 (2026-09-25): The topic editor handles one level per topic, matching all 69 source rows; `levels` remains an array in Firestore for a future shared-topic feature. Reordering saves sequential `order` values for the selected level. The seeded rows use stable IDs such as `f5-ch18`, so reseeding updates their code, name, strand and order without duplicating them or deleting topics added in the editor.
- Phase 3 (2026-09-25): Deleting a topic first queries `mistakeBooks` for a matching `topicId` and refuses deletion when any book uses it. Firestore rules still restrict topic writes to teachers. This is an editor integrity check; Phase 4's book workflow must preserve valid topic references when books are added or moved.
- Phase 4 (2026-09-26): A book uses a fixed Storage path `mistake-books/{edition}/{bookId}/{bookId}.{fileType}`. Edition, file type, uploader and path cannot be changed after creation; replacing a file keeps its path. Storage reads require a matching book record and its exact path, so orphan or unrecorded files remain unreadable. Teachers may upload only the three approved types up to 20 MB. Files are read through `getBlob`, not shared download tokens; HTML uses an iframe with `allow-scripts` and no same-origin permission.
- Phase 4 (2026-09-26): The public access decision still applies to student-edition files, including downloads by signed-out visitors. The Home latest list includes student editions only. `react-pdf` is used for in-page PDF rendering. Real-bucket CORS setup is deferred to Phase 8; no real Firebase project was changed.
- Phase 5 (2026-09-26): Web Apps are registered in a static typed list and lazy-loaded on their detail pages. The index reads the registry directly; Phase 6 will merge saved teacher settings for visibility and ordering. The apps do not use Firebase. New apps add their wording to the central `copy.ts` file and one registry entry.
- Phase 5 (2026-09-26): The inequality tool accepts a small documented grammar for one linear inequality or a bounded compound inequality; it parses input without evaluating code. Presentation mode enlarges the tool in the page when the browser cannot enter fullscreen, and its button waits for the lazy app to hydrate.
- Phase 6 (2026-09-26): Home copy lives in `siteContent/home`; per-app title, summary, featured, visible and order settings live in `appSettings/{slug}`. The static app registry supplies defaults and available routes. Teachers can edit in the page; Firestore rules validate every saved field and authorize writes. The seed script creates default Home content only when absent, preserving teacher edits on later runs.
- Phase 6 (2026-09-26): Hidden apps remain visible to teachers for editing. Visitors and viewers cannot see them in the index or open their direct routes. Saved settings are loaded before a detail app renders, so a hidden app is never briefly exposed while loading. The edit toggle resets on sign-out.
- Phase 7 (2026-09-26): `npm run test:e2e` uses the installed Chrome browser, starts the local app and demo emulators on free ports, waits for all emulators, and seeds the three local test accounts before running four smoke tests. A hard check on the emulator flag and `demo-lskc-maths` project ID prevents this setup from seeding any real Firebase project. Lighthouse was run as a one-off CLI tool against the local production build; it was not added as a project dependency.
- Phase 7 (2026-09-26): Production Lighthouse mobile performance is 78 on Home and 77 on Quadratic Explorer, with accessibility, best practices and SEO at 100 on both. The report's largest opportunity is unused JavaScript; a larger bundle split was deferred because these pages need the Firebase Auth and Firestore clients and Phase 7 has no performance-score target. Recheck with real content after launch.
- Phase 8 preparation (2026-09-26): App Hosting uses `apphosting.yaml` for the public access mode, teacher domain and emulator-off flag. The linked Firebase web app supplies `FIREBASE_WEBAPP_CONFIG` at build time; `next.config.ts` maps it to the site's six `NEXT_PUBLIC_FIREBASE_*` values, keeping real project values out of git. The existing `firebase.json` already names both generated rule files and Firestore indexes. README now records the exact live setup, CORS and verification steps. No real Firebase project has been changed; live setup and tests remain open.
- Phase 8 preparation (2026-09-26): Read-only Firebase CLI inspection found an existing LSKC project with a Claim Tracker web app and default Firestore, on the Spark plan. Deploying this site's rules there would replace rules used by that project. The launch guide therefore calls for a dedicated Mathematics project; no existing Firebase project was modified.

### Phase 1 design decisions (2026-09-21, approved by the owner)

Type: **Spectral** for headings (a text face, not a UI face — keeps the exercise-book
feel), **IBM Plex Sans** for everything else (unambiguous digits and `1 / l / 7`, which
matters on a maths site), KaTeX's own fonts for notation. Scale: hero
`clamp(2rem, 4.6vw, 3.25rem)`, section 1.375rem, card 1.125rem, body 1rem, meta 0.8125rem.

Home, top to bottom:

```
+--------------------------------------------------------------+
| [crest] LSKC Mathematics          Home  Web apps  Mistakes    |  navy bar
|         S.T.F.A. Lee Shau Kee College            book [Sign in]
+--------------------------------------------------------------+
|  . . . . . . . . . . graph paper . . . . . . . . . . . . . .  |
|   Mathematics Department        |        \        /           |
|   Interactive tools for the     |         \      /            |
|   classroom, and every          |          \____/  <- drag    |
|   Mistakes Book in one place.   |      [ y = 0.5(x-1)^2 - 2 ] |
+--------------------------------------------------------------+
|  =========== navy              |  =========== crimson         |
|  Web apps                      |  Mistakes book               |
|  Interactive tools by level... |  Correction notes by topic...|
+--------------------------------------------------------------+
|  Latest uploads                                               |
|  [F5] Ch18  Measures of dispersion - quiz 3           18 Sep  |
|  [F3] 3A03  Linear inequalities in one unknown        15 Sep  |
+--------------------------------------------------------------+
```

- The draggable parabola is the one bold element; everything else stays quiet. It links
  through to the full quadratic explorer (Phase 5) rather than duplicating it.
- Entry cards carry their identity as a 3px top rule (navy / crimson), not as shadowed
  boxes. No gradients, no entrance animations.
- The hero band is literal graph paper (CSS grid lines); the parabola is drawn straight
  onto it, so there is only ever one grid on screen.
- **Deviation from the approved mock-up:** on a phone the title and intro come first and
  the graph follows, rather than the graph on top. A 270 px graph above the title pushed
  everything below the fold. Easy to flip back if the owner prefers the original.
- The vertex is keyboard operable (`role="slider"`, arrow keys, 0.5 steps) and
  touch-draggable; pointer capture keeps a drag alive outside the circle.

### Phase 0 decisions (2026-09-21)

- **The project lives on local disk**, `C:\Users\t28ltk\Projects\lskc-maths`, not in Google Drive. `node_modules` is tens of thousands of small files and would keep Drive syncing constantly. Backup is GitHub, which App Hosting needs anyway. A `MOVED - read me.txt` note was left in the old Drive folder.
- Installed on the owner's machine via `winget`: **Node.js 24.19.0 LTS** and **Microsoft OpenJDK 21** (the Firestore and Storage emulators are Java programs).
- `@types/node` raised from create-next-app's `^20` to `^24`, matching the installed Node and required by Vitest 5.
- npm 11 blocks package install scripts by default. Five are approved by name in `package.json` → `allowScripts` (`@firebase/util`, `protobufjs`, `unrs-resolver`, `esbuild`, `re2`). Adding a dependency with install scripts will need the same approval.
- `firebase-tools` is a **dev dependency**, not a global install, so the version is pinned in the repo and survives a new machine. Call it via `npx firebase` or an npm script.
- Next.js telemetry disabled.
- Markdown files are excluded from Prettier so the hand-written tables in `CLAUDE.md`, `PLAN.md` and `docs/topics.md` keep their layout.
- File access via SDK `getBlob`, not persistent download URLs, so rules apply on every read.
- Uploaded HTML rendered only in a sandboxed `srcdoc` iframe without `allow-same-origin`.
- Teachers edit, students view: every browser-editable collection is teacher-write-only in the rules; students have no write path.
- Hiding a Web App is a display choice, not a secret: the app code ships with the site, so hidden apps are simply removed from students' lists and pages.
