# Latest official website for Dot

Updated 11/10/2026.

- Repository: https://github.com/lautinkong-debug/lskc-maths
- Canonical branch: `main`. Use this branch for all subsequent work.
- Official website: https://lskc-maths.vercel.app
- Vercel project: `lskc-maths`, scope `lautinkong-4501`.

## Included features

The complete mathematics department website includes Web Apps and Mistakes Book
with the 69 textbook topics. Statistical Charts includes direct frequency editing,
boundary/class-mark axis labels, side-by-side table/chart teaching views,
representation connections, animated walkthroughs, and **09 · Four words, one class**.
The vocabulary activity defines intervals and both class limits, shows both midpoint
formulas, and includes **Why boundaries?**: animated gap closing, exact shared-endpoint
assignment and a movable measurement, with explicit rounding and membership rules.
Directed Numbers includes the bird method, sign/magnitude lessons and 122 numerical
textbook calculation parts. Preserve all these features when making changes.

This consolidation combines vocabulary commit `a5dba90` with the Directed Numbers
source already published in deployment `dpl_B4cpxr5ZKXgdjHRpKxSBLggMHUf4`.
Application code matches the combined live release
`dpl_B5e3cLveCsScaLS2eXvst2cYRDDS`; subsequent Git builds may have a newer deployment ID.
The application source and configuration were compared with that release snapshot,
and all 337 focused maths/activity tests passed before consolidation.

## Continue development

Read `AGENTS.md`, `CLAUDE.md`, `PLAN.md`, `docs/topics.md` and the relevant installed
Next.js documentation. The website is English-only and uses the school's navy/red
identity. Keep classroom projection, phone layouts and misconception-specific feedback.

Use Node.js 24. Install with `npm ci` (`npm.cmd ci` on Windows). Follow README for
the Firebase Emulator Suite and local development. Local development uses
`demo-lskc-maths`; a fresh checkout needs `.env.local` prepared from `.env.example`.
Production secrets remain on Vercel and are intentionally absent from GitHub.

Run the relevant unit/browser checks and production build before publishing.
Git history is retained for recovery, but old feature branches are superseded by `main`.
