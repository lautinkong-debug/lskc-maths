# PLAN.md — LSKC Mathematics Department Website

Status legend: `[ ]` to do · `[x]` done. Work one phase at a time and stop for the owner's review at the end of each phase.

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
Browser (Next.js app on Firebase App Hosting)
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
- [x] Note in the README how to switch to `school` mode later (one variable, rebuild rules, redeploy)

---

## Directed numbers — Stage A (27/09/2026)

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

## Decision log

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
