# Statistical Charts Lab: department website handoff

Updated 11/10/2026 for continuation from GitHub. Use `main` and read
[`dot-handoff.md`](dot-handoff.md) for the complete current website.

Canonical branch: [main](https://github.com/lautinkong-debug/lskc-maths/tree/main).
The older department and vocabulary branches are superseded. The release history
below records earlier milestones, not branch-selection instructions.

## Intended result

The owner asked to include the completed lab in the mathematics department website, then requested a GitHub upload
for later processing. Continue from branch `main`. This is the complete department website,
not a standalone replacement for it. On 10/10/2026 the owner authorised updating the existing production website.

The application is registered at `/apps/statistical-charts` and appears in **Web apps → F2 → Data Handling**.
Searching **2A06** finds its card. The existing app host supplies school navigation, title, availability controls,
and projection mode. Activity links retain `/apps/statistical-charts` and their encoded URL fragment.

## What is included

- All four lab phases: data generation/editing, five chart types, construction teaching/practice, chart comparisons,
  teacher controls, printing and exports, shared activities, percentile/quartile estimates and two-group comparison.
- Browser-local progress and a local teacher activity library. No cloud student-progress schema or new Firebase writes.
- The registered thumbnail and F2/2A06 metadata, production and standalone build scripts, and automated tests.
- `.vercelignore` explicitly excludes local environment files, credentials under `.vercel`, build output and test artifacts.

Read `CLAUDE.md`, `PLAN.md`, `docs/topics.md`, and the relevant installed Next.js documentation before changing code.
`docs/statistical-charts-lab.md` contains mathematical conventions, manual review steps and storage limitations.
The textbook is reference material only and is not uploaded.

## Historical repository base at the original handoff

At handoff, GitHub `main` was `04f27ecaae26e368dedf8db5ac23033da834bb94`.
The local website base was `be32393` with 21 existing commits beyond that `main`, including the department features,
directed-numbers app and Vercel runtime configuration. This branch retains those commits because the statistical app
depends on the completed app host. Its difference from `main` therefore includes earlier website work too.
Review the final Statistical Charts commit separately to isolate this addition. Do not replace the site with an old
checkout of `main`, or cherry-pick only the statistical files into that incomplete base without their dependencies.
These commit comparisons describe the original handoff; current `main` now contains the complete source.

## Run and verify

Use Node.js 24 and `npm.cmd` on Windows. Copy `.env.example` to `.env.local` on a fresh checkout; keep
`NEXT_PUBLIC_USE_EMULATORS=true` and project `demo-lskc-maths`. Java and the Firebase Emulator Suite are required for site tests.

```powershell
npm.cmd ci
npm.cmd run test
npm.cmd run lint
npm.cmd run test:statistics:e2e
npm.cmd run test:statistics:site
```

`test:statistics:e2e` builds the standalone version and runs its 42 browser scenarios on port 3217.
`test:statistics:site` builds the full Next.js website, starts `next start` plus local emulators, seeds only the
demo project, and checks the actual listing/filter/navigation/projection and mobile sharing/progress flows.
Stop another website/emulator process before this suite so ports 3000, 8080, 9099 and 9199 are available.

Recorded verification: 336 project unit tests and 42 standalone Chrome scenarios passed during Phases 1–4.
The final department production build and both integration tests passed on 10/10/2026, including the 1280×720
projection graph fitting inside the viewport. Desktop projection and 390 px phone screenshots were inspected.
ESLint passed. The new projection adjustments are scoped to this lab; other teaching apps retain their existing styling.

For manual review, run `npm.cmd run dev:all` and open `http://localhost:3000/apps`.
For the separate no-backend preview, run `npm.cmd run build:statistics` then `npm.cmd run preview:statistics`;
open `http://127.0.0.1:3216/`. These two browser origins have separate local progress.

## Production release continuation (10/10/2026)

Read-only inspection confirmed the existing Vercel project `lskc-maths`, ID `prj_gDfV3Ghov8KxYuPORUZ6J4DyIEIc`,
under team `team_uV3gE1tXDyPLZgD0VVTk3BNh`. Production URL: `https://lskc-maths.vercel.app`.
The old-main deployment `dpl_EA7RkLN9E3tMUDGikC8FcUwBo4Tg` built commit `04f27ec` and replaced the
earlier department deployment `dpl_8FK2k8WCFF4aDW9beg8UvyqrY3nf`. Its Web apps and Mistakes Book routes
were still placeholders. The renamed complete branch was verified at `70b23cd` before this release documentation update.
These observations may change; inspect the current target again before any release.

No Vercel deployment or production Firebase mutation was made during the original handoff. A subsequent staging
attempt was blocked before building because the commit author's school email did not match the owner's Vercel account.
New release commits use the owner's verified account email; existing shared commits retain their original authors.
Preserve the existing Vercel
production environment and server-only Firebase Admin secret. Never upload `.env.local` or use emulator build output
as a production prebuilt artifact. When publication is requested, stage a production-configured deployment, verify
the app card and actual route on that deployment, then promote the verified build to the existing domain.
No Firebase Hosting deployment or database/rules change is needed to add this client-side teaching app.

Published at `https://lskc-maths.vercel.app` on 10/10/2026 by promoting the verified production-configured
deployment `dpl_2PCge2tfjdGYg4qUF1Y6ssqGH2J9` (`lskc-maths-8npcz7xi4-lautinkong-4501.vercel.app`),
from release commit `0dd44c2`. Both GitHub `main` and `LSKC-Mathematics-Department-Website` were fast-forwarded
to this complete website before the release-record commit. Fresh signed-out Chrome checks on the public domain
passed: five app cards, F2/Data Handling navigation, percentile estimate 29.5, practice-answer reload restoration,
390 px phone overflow check, and 69 Mistakes Book topics across F1-F6. The browser requested the production
Firebase project `lskc-maths-2026`; no emulator project was used and no browser runtime errors were observed.
The selected Directed Numbers topic displayed its correct empty-book message. Desktop and phone screenshots were reviewed.

For future releases: stage with production configuration and `--skip-domain`, verify all five app cards, the
Statistical Charts route and its mobile progress restoration, and the Mistakes Book topic browser. Fast-forward
GitHub `main` to the complete website, then promote the verified deployment to
`https://lskc-maths.vercel.app`. An empty book list means no published books match the selected topic; it does not
mean the Mistakes Book feature is missing. Signed-in teacher editing needs a separate authenticated check.

## Known limits

Local progress is device/browser-specific. Shared activity files contain settings and instructions, not attempts.
Teacher controls inside the lab are classroom aids, not authenticated assessment restrictions. Actual iOS Safari,
physical projectors, cloud progress and signed-in production teacher editing have not been checked for this addition.
The local development server generated a malformed `.next/dev/types/routes.d.ts` during integration testing; its
generated development cache was cleared before the production-build integration check. Do not commit generated `.next` files.
