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

## Phase 1 — Design system, layout and Home

- [ ] Tailwind tokens (palette, type scale), fonts via `next/font`
- [ ] Short written design plan (tokens + ASCII wireframe of Home) in the Decision log; owner approves before building
- [ ] Site header (crest + school name, Home / Web Apps / Mistakes Book, account menu placeholder), footer
- [ ] `<Math>` KaTeX component
- [ ] Home: interactive graph-paper hero, two entry points, "Latest uploads" with mock data
- [ ] Placeholder pages for all routes
- [ ] Check at 360 px, 768 px, 1440 px, 1920 px

**Test:** browse all pages on desktop and phone-sized window (browser dev tools).

## Phase 2 — Sign-in, roles and security rules

- [ ] `AuthProvider` + `useAuth()` returning `{ user, role: 'visitor' | 'viewer' | 'teacher' | 'admin' }`
- [ ] `/login` with Google (`hd` hint); clear message + sign-out for accounts outside `lskc.edu.hk`, and for `lskc.edu.hk` accounts not on the teacher list ("You're signed in, but you don't have teacher access yet — ask an admin.")
- [ ] `<AuthGate>` honouring `NEXT_PUBLIC_ACCESS_MODE`: pass-through in `public`, login wall in `school`; `<RequireRole role="teacher">` / `"admin"` always enforced on `/manage/*` and `/admin/*`
- [ ] Rule templates + `scripts/build-rules.ts` (substitutes both the access mode and the allowed domains)
- [ ] `firestore.rules` and `storage.rules` implementing the permissions matrix
- [ ] `/admin/teachers` page; header shows "Sign in" for visitors, account menu for teachers
- [ ] `npm run seed`: admin `t28ltk@lskc.edu.hk`, a second teacher, a non-teacher `lskc.edu.hk` account (emulator accounts)
- [ ] Rules tests covering every row of the matrix **in both access modes**, plus other-domain and unverified-email accounts

**Test:** open the site in a private window with no account — Home, Web Apps and student-edition books all work. Sign in as the admin — Manage menu appears. Sign in as the non-teacher account — no Manage menu, teacher-edition items hidden. `npm run test:rules` all green.

## Phase 3 — Topics management

- [ ] Typed helpers in `src/lib/db/topics.ts`
- [ ] `/manage/topics`: add, edit, delete (blocked if books use the topic), reorder within a level
- [ ] Seed script loads `docs/topics.md` (the 69 F1–F6 topics) into `topics/`

**Test:** as teacher, add/edit topics; signed out, confirm `/manage/topics` is refused and the rules block writes.

## Phase 4 — Mistakes Book

- [ ] Typed helpers in `src/lib/db/books.ts` (student queries always filter `edition == 'student'`)
- [ ] `/manage/upload`: title, description, level, topic (filtered by level), edition, file; client-side checks for type/size; progress bar; write Firestore doc + Storage file, clean up on failure
- [ ] `/manage/books`: list, edit metadata, replace file, delete (doc + file)
- [ ] `/mistakes-book`: level tabs → topics → books, edition badge (teachers see both)
- [ ] `/mistakes-book/[id]`: PDF via react-pdf; HTML via sandboxed `srcdoc` iframe; DOCX download via `getBlob`
- [ ] Home "Latest uploads" wired to real data
- [ ] Rules tests for Storage uploads (size, type, role, edition path)

**Test:** upload one of each type as teacher; view them signed out in a private window; confirm a signed-out visitor cannot open a teacher-edition link directly, even with the exact URL.

## Phase 5 — Web Apps

- [ ] `registry.ts` type + `/apps` index with level/strand filters and search
- [ ] `<PresentationFrame>` + `usePresentation()`
- [ ] App: **Quadratic explorer** — sliders for a, b, c; plot of y = ax² + bx + c; vertex, axis of symmetry, roots (or "no real roots" with discriminant); equation shown in KaTeX
- [ ] App: **Unit circle** — drag a point around the circle; angle in degrees; live sin θ, cos θ, tan θ with projections drawn; quadrant signs
- [ ] App: **Inequality number line** — enter e.g. `2x - 3 > 5` or compound `-1 ≤ x < 4`; show solving steps and the solution on a number line with open/closed dots
- [ ] SVG thumbnails for each app
- [ ] A short `src/apps/README.md` explaining how to add a new app

**Test:** use each app with mouse, on a phone-sized window, and in Presentation mode at 1920×1080.

## Phase 6 — Teacher edit mode

- [ ] Typed helpers `src/lib/db/siteContent.ts`, `src/lib/db/appSettings.ts`
- [ ] Rules: `siteContent` and `appSettings` readable per the access mode, writable only by teachers; field validation (types, string lengths)
- [ ] Header "Edit page" toggle, rendered only for teachers; edit state in a React context
- [ ] `<EditableText>` component: dashed outline in edit mode, inline editor, Save / Cancel, "Saved" confirmation, "Last edited by … on …"
- [ ] Home: hero title, intro, announcement banner editable
- [ ] Web Apps index: edit title/summary, toggle featured and visible, drag to reorder; registry defaults merged with `appSettings`
- [ ] Non-teachers: hidden apps filtered out of the index; `/apps/[slug]` for a hidden app shows "This app isn't available right now"
- [ ] Seed default `siteContent/home`
- [ ] Rules tests: write attempts to `siteContent`, `appSettings`, `topics`, `mistakeBooks` and Storage by a visitor and by a signed-in non-teacher are all rejected; teacher writes succeed

**Test:** sign in as teacher → toggle Edit page → change the Home intro and hide one app → open the site in a private window → see the new intro, no hidden app, no edit controls.

## Phase 7 — Polish and hardening

- [ ] Accessibility pass (keyboard, focus, contrast, labels)
- [ ] Empty/error states on every page
- [ ] Playwright smoke tests: login gate, browse books, open an app
- [ ] Lighthouse check on Home and one app

## Phase 8 — Go live

- [ ] README, plain-English, step by step: create Firebase project; enable Google sign-in; upgrade to Blaze and **set a budget alert (e.g. HK$20/month) — not optional in public mode**; create Firestore + Storage; set `NEXT_PUBLIC_ACCESS_MODE` and `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`; `npm run rules:build`; deploy rules; create the first admin document `teachers/t28ltk@lskc.edu.hk` by hand; connect GitHub to App Hosting; add the App Hosting domain to Auth authorised domains
- [ ] `apphosting.yaml` with the public env vars
- [ ] `firebase.json` rules and indexes deploy config
- [ ] Post-launch checklist: open the live site signed out, sign in as teacher, upload one test file, check it appears signed out, delete it
- [ ] Note in the README how to switch to `school` mode later (one variable, rebuild rules, redeploy)

---

## Decision log

- Hosting: Firebase App Hosting (one platform with Auth/Firestore/Storage). Requires Blaze plan.
- UI language: English only — no Chinese topic names (owner's decision, 2026-09-21). Re-addable later as one optional field.
- M2 deferred: the level and strands exist in the constants, but nothing is seeded or built for M2 until asked.
- **Access: public for now.** The owner asked that anyone be able to view the site. Reading is open to the internet for topics, site content, app listings and student-edition books; teacher-edition material and every write still require a teacher sign-in. Built as a build-time switch (`NEXT_PUBLIC_ACCESS_MODE`) so it can be closed to `lskc.edu.hk` later without touching page code. A Blaze budget alert is required at launch because public read means public egress.
- Palette taken from the school crest (#DA2127 red, #0F4574 navy) rather than invented colours; the exercise-book theme is rendered in those.
- Topic codes (`1A01`, `2B07`, `Ch13`) are stored on each topic, so the site matches the file names the department already uses. Senior forms share one Ch0–Ch31 sequence across F4–F6.

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
