@AGENTS.md

# CLAUDE.md — LSKC Mathematics Department Website

Read this file at the start of every session. Read `PLAN.md` for the phase you are working on.

## What this project is

A website for the Mathematics Department of S.T.F.A. Lee Shau Kee College (順德聯誼總會李兆基中學), a Hong Kong secondary school. It has two jobs:

1. **Web Apps** — interactive teaching tools, one per topic, that teachers project in class (1920×1080 projector) and students revisit on their phones.
2. **Mistakes Book** — teacher-uploaded correction notes (PDF / DOCX / HTML), organised by topic and level, in a student edition and a teacher edition.

Curriculum context: HKDSE Mathematics, levels F1–F6 plus Extended Part Module 2 (M2). **M2 is out of scope for now** — the level and its strands stay in the constants so M2 can be switched on later, but no M2 topics are seeded and no M2 content is expected. Build and test against F1–F6.

## School identity

- School crest: `public/school-logo.png` (transparent background, 1463×1417), `public/school-logo-512.png` (web size). Master copies in `assets/`, including the original `school-logo-original.jpg`.
- Official crest colours, sampled from the file: **red #DA2127**, **navy #0F4574**. These drive the palette below — do not invent other brand colours.
- First admin: `t28ltk@lskc.edu.hk`.
- Teacher email domain: `lskc.edu.hk`.

## Working agreement

- The project owner is a maths teacher, not a professional programmer. Explain setup steps in plain English, one click at a time, and say which screen of the Firebase / Google Cloud console you mean.
- Work one phase of `PLAN.md` at a time. **Stop at the end of each phase** and tell the owner exactly how to test it locally (commands to run, pages to open, accounts to sign in with, what they should see).
- Develop against the **Firebase Emulator Suite**. Never write to, deploy to, or change rules on the real Firebase project unless the owner explicitly asks in that session.
- Ask before adding a new dependency that isn't listed below.
- Keep `PLAN.md` up to date: tick completed tasks and record decisions under "Decision log".

## Language

- **Everything on the site is in English — UI chrome and topic names alike.** British spelling is fine (HK schools use it): "colour", "organise". The department's own chapter files are named in English, so the site matches them.
- There is **no Chinese-name field** on topics. The owner decided against it on 2026-09-21. If that ever changes it is one optional field plus a secondary label, not a redesign.
- Keep all UI strings in `src/lib/copy.ts` so wording stays consistent and can be changed in one place.

## Tech stack

- Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4
- Firebase: Authentication (Google provider), Firestore, Cloud Storage, App Hosting
- Firebase Web SDK (modular v10+ API) on the client
- KaTeX (`katex`, rendered via a small `<Math>` component) for all mathematical notation
- `react-pdf` (pdf.js) for in-page PDF preview — browser-native PDF iframes are unreliable on iOS
- Testing: Vitest for units, `@firebase/rules-unit-testing` for security rules, Playwright for a few smoke tests
- Lint/format: ESLint (next config) + Prettier
- `firebase-tools` is a **dev dependency**, not a global install — always call it through `npx firebase` or an npm script.

## Commands

```
npm run dev            # Next.js dev server (http://localhost:3000)
npm run emulators      # Firebase emulators: auth, firestore, storage (+ UI at :4000)
npm run dev:all        # both of the above together
npm run seed           # seed emulators with sample teachers, topics and files
npm run rules:build    # generate firestore.rules / storage.rules from templates
npm run test           # unit tests
npm run test:rules     # security-rules tests (needs emulators)
npm run lint
npm run build
```

Environment variables (all in `.env.example`):

| variable | meaning |
|---|---|
| `NEXT_PUBLIC_USE_EMULATORS` | `true` locally — `src/lib/firebase.ts` must then point every Firebase service at the local emulators |
| `NEXT_PUBLIC_ACCESS_MODE` | `public` (anyone may read) or `school` (allowed domains only) — see Security model |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | comma-separated, currently `lskc.edu.hk`; gates teacher sign-in, and reading too in `school` mode |
| `NEXT_PUBLIC_FIREBASE_*` | the Firebase web config (public by design) |

`npm run rules:build` reads `NEXT_PUBLIC_ACCESS_MODE` and `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` and bakes them into `firestore.rules` / `storage.rules`. Rebuild and redeploy rules whenever either changes.

## Directory layout

```
src/
  app/
    page.tsx                      Home
    login/page.tsx
    apps/page.tsx                 Web Apps index (filter + search)
    apps/[slug]/page.tsx          Hosts one app from the registry
    mistakes-book/page.tsx        Browse by level / topic
    mistakes-book/[id]/page.tsx   Preview / download one book
    manage/                       Teacher-only
      upload/page.tsx
      books/page.tsx              Edit / delete books
      topics/page.tsx             Add / edit / reorder topics
    admin/teachers/page.tsx       Admin-only teacher list
  apps/                           Interactive teaching apps
    registry.ts                   THE list of apps
    quadratic-explorer/
    unit-circle/
    inequality-number-line/
  components/                     Shared UI (AuthGate, Math, PresentationFrame, FileViewer…)
  lib/
    firebase.ts                   Init + emulator wiring
    auth.tsx                      AuthProvider, useAuth(), role lookup
    copy.ts                       All UI strings
    constants.ts                  Levels, strands, file limits
    db/                           Typed Firestore helpers (topics, books, teachers)
rules/
  firestore.rules.template
  storage.rules.template
scripts/
  build-rules.ts                  Substitutes allowed domains into the rule templates
  seed.ts
tests/rules/                      Security-rules tests
docs/
  topics.md                       Topic list (source of truth for the seed script)
assets/                           School crest, master copies
```

## Security model (non-negotiable)

The UI hiding a button is a convenience, never the protection. Every permission below must be enforced in `firestore.rules` and `storage.rules`, and covered by a test in `tests/rules/`.

- **Core principle: teachers edit, everyone else views.** Every piece of content that can be changed from the browser (home page text, announcements, Web App listings, topics, Mistakes Books) is writable only by signed-in teachers. There is no write path for anyone else anywhere in the rules — not for students, not for anonymous visitors.
- **Access mode is configuration**, via `NEXT_PUBLIC_ACCESS_MODE`:
  - `public` — **the current setting.** Anyone, signed in or not, can read topics, site content, app listings, **student-edition** books and their files. No login wall.
  - `school` — reading requires `request.auth.token.email_verified == true` and an email ending in an allowed domain.
  - Switching mode is one variable + `npm run rules:build` + deploy rules. No page code changes: read gating lives in `<AuthGate>` and the rules, both driven by this variable.
- **Teacher-edition books and files are never public.** In both modes they require a signed-in teacher. The same goes for `/manage/*` and `/admin/*`.
- **Teacher sign-in domain is configuration.** `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` (comma-separated, currently `lskc.edu.hk`). Security rules cannot read env vars, so `npm run rules:build` generates the rule files from templates using the same variable. Always rebuild rules after changing it. The Google sign-in `hd` parameter is only a UX hint — the rules are the real check.
- **Teacher** = a document exists at `teachers/{lowercased email}`. **Admin** = that document has `isAdmin == true`.
- **Public mode has a cost consequence, and it is accepted.** The Firebase web config ships in the page, so in `public` mode anyone on the internet can read those collections and download student-edition files directly, not only through this site. Mitigations, in order: a Blaze budget alert (set during Phase 8), the 20 MB per-file cap, and Firebase App Check if abuse ever shows up. Never widen public read beyond the list above.
- Teachers read everything and create/update/delete books and topics. Only admins write to `teachers/`.
- Rules are not filters: any query run by a non-teacher must include `where('edition', '==', 'student')`, or Firestore will reject it. Put this in the query helpers, not in page code.
- Storage paths encode the edition: `mistake-books/{edition}/{bookId}/{fileName}`. Storage rules check the edition from the path, use `firestore.exists()` to check teacher status, and on upload enforce size ≤ 20 MB and an allowed content type.
- Load files with the SDK (`getBlob` / `getBytes`) so rules apply on every read. **Do not store or share long-lived `getDownloadURL` tokens** — anyone holding one can read the file without signing in.
- Uploaded HTML is untrusted. Render it with `<iframe sandbox="allow-scripts" srcdoc=…>` — never add `allow-same-origin`, never `dangerouslySetInnerHTML` it into the app.

## Teacher edit mode

- Teachers see an **Edit page** toggle in the header on Home, Web Apps and Mistakes Book. Nobody else sees it (and the rules would reject their writes anyway).
- In edit mode, editable text shows a dashed `highlight` outline and opens an inline editor; changes save to Firestore with a clear "Saved" confirmation and show who last edited and when.
- Editable content:
  - Home: hero title, intro paragraph, announcement banner (text, optional link, on/off) — stored in `siteContent/home`.
  - Web Apps: per-app title, summary, featured flag, visibility (shown/hidden), display order — stored in `appSettings/{slug}` and merged over the defaults in `registry.ts`. Hidden apps are invisible to students; teachers still see them, marked "Hidden".
  - Topics and Mistakes Books: via the Manage pages.
- The app code itself (the interactive apps) is not editable from the browser; new apps are added in code.
- Plain text or limited Markdown only (bold, italic, links, KaTeX `$…$`). Never render teacher-entered HTML.

## Web Apps pattern

- Every app lives in `src/apps/<slug>/` and default-exports a React component.
- Register it with one entry in `src/apps/registry.ts`: `slug, title, topic, levels, strand, summary, thumbnail, load: () => import('./<slug>')`.
- `/apps/[slug]` wraps the app in `<PresentationFrame>`, which provides the Presentation mode button (Fullscreen API + larger type/controls) and exposes `usePresentation()` so apps can enlarge labels.
- Apps are pure client components, need no Firebase access, and must work with mouse, touch and keyboard.
- Adding an app must never require touching any file other than its own folder and `registry.ts`.

## Design direction

Theme: **the maths exercise book** — graph paper, pencil, and the teacher's red correction pen — drawn in the school crest's own navy and red. Match this, and don't drift into a generic SaaS look.

- Palette (define as Tailwind theme tokens, never raw hex in components):
  - `paper` #FBFCF8 — page background
  - `grid` #D6E2EC — graph-paper lines, subtle dividers
  - `graphite` #262A2E — body text
  - `navy` #0F4574 — **school blue**; header, primary buttons, Web Apps identity
  - `navy-deep` #0A3157 — hover/pressed state for navy
  - `crimson` #DA2127 — **school red**; Mistakes Book identity, correction-pen accent, used sparingly
  - `highlight` #F1D54A — focus states and selected filters
- The crest is the only place navy and red sit side by side at full strength. Elsewhere pick one per surface: navy for Web Apps, crimson for Mistakes Book.
- Type: **Spectral** (headings), **IBM Plex Sans** (UI/body), KaTeX's own fonts for maths. Load with `next/font`.
- Home hero: a live graph on graph paper (e.g. a parabola the visitor can drag) — this is the one bold element. Keep the rest calm.
- Mistakes Book uses `crimson` as its identity; Web Apps use `navy`. The crest appears in the header and on the Home hero, never stretched or recoloured.
- Avoid: all-caps eyebrow labels, identical shadowed cards for everything, gradient washes, entrance animations on every section.
- Quality floor: responsive from 360 px to 1920 px, readable from the back of a classroom in Presentation mode, visible keyboard focus, `prefers-reduced-motion` respected, WCAG AA contrast.

## Code conventions

- Server components by default; `"use client"` only where needed (auth, Firebase calls, interactivity).
- All Firestore reads/writes go through typed helpers in `src/lib/db/` with converters; no raw `collection()` calls in pages.
- Timestamps use `serverTimestamp()`.
- Show clear empty and error states ("No books for this topic yet. Teachers can upload one from Manage.").
- No secrets in the repo. Firebase web config is public by design; access control lives in the rules.
