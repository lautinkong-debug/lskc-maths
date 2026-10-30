# Equation Village — Stage B local verification

Date: 26/10/2026. User approved Stage B with “go”. Status: local prototype ready for owner review; not published.

## Open and try

- Local route: http://localhost:3000/apps/equation-village
- The existing local Next.js server and demo Firebase emulators were reused; no shared services were reset or stopped.
- Click Start bridge repair. Choose Subtract, enter 3, keep Both sides, and apply. Then Divide by 2. Enter x = 4 in the check and restore the bridge.
- Try a fresh equation: 3x + 2 = 17 has x = 5. An incorrect answer explains the working and offers 2x + 5 = 17 (x = 6).
- Try a one-sided operation, use a hint, undo or replay. Refresh to resume. Scene options offer quiet, reduced-motion, lighter-graphics and illustrated views. Sound starts off.
- If the existing preview is later stopped: from this project folder run npm.cmd run dev:all, then open the route above. Use demo-lskc-maths; do not change the Firebase project.

## Delivered

An original procedural Three.js harbour, workshop, lighthouse, bird mechanic and articulated bridge; matching algebra trays; exact rational transformations; worked equations; substitution check; correction and similar retry; honest assistance labels; validated device-local persistence; projection and phone layouts; keyboard/touch controls; WebGL fallback.

The app is registered under F1 1A04. School navigation and mathematical panels keep the existing identity; the approved natural scenery palette is contained within the game. No BAFS Valley artwork, character models or source code was copied into production. No external art requests are needed at runtime.

New approved packages: three 0.186.1 and @types/three 0.186.0. No live Firebase writes or deployment were performed.

## Verification

| Check | Result |
| --- | --- |
| Pure equation and saved-state tests | 80 passed in two suites; includes 768 generated transformation/invariant cases. |
| Browser integration | 14 passed; 0 failures, skips or flaky results. |
| Projection follow-up | Current line stays inside the ledger, including seven extra steps; passed after the layout fix. |
| Phone/short-working follow-up | Both affected browser tests passed after the final layout change. All three working rows fit at 360px and 390px; longer histories scroll to the current row. Phone and projection screenshots refreshed. |
| Scoped TypeScript | Passed with out/equation-village/tsconfig.json, including the final layout change. |
| Scoped ESLint | Passed for prototype code, shared copy/registry and tests. Final scoped ESLint, TypeScript and changed-UI Prettier checks also passed. |
| Production build | Bundling succeeded, but the full-project TypeScript phase failed in separate src/apps/linear-equations/animation.ts at lines 36 and 38 (bigint/number operations). This unrelated work was left untouched. A successful full-project build is not claimed. |

Browser coverage: normal completion; one-sided and zero operations; fractions and negative coefficients; valid alternate steps; neutral display limits; no-op/duplicate handling; hints and support labels; original-equation checks; wrong-transfer correction through refresh; a fresh retry; undo/replay synchronisation across 3D, illustration and written working; corrupt/blocked storage; separate browser contexts; keyboard; 360/390px phones; 1920px projection; reduced motion; forced WebGL failure.

Evidence: out/equation-village-verification/browser-results.json, bridge-start.png, bridge-restored.png, phone-360.png, phone-390.png, projection-simple-view.png and webgl-fallback.png. Art review: out/equation-village/harbour-scene-current.jpg.

Commands used:

```text
node node_modules/vitest/vitest.mjs run tests/unit/equation-village.test.ts tests/unit/equation-village-session.test.ts --maxWorkers=1 --no-file-parallelism --no-isolate
node node_modules/playwright/cli.js test --config playwright.equation-village.config.ts
node node_modules/typescript/bin/tsc --noEmit -p out/equation-village/tsconfig.json
node node_modules/eslint/bin/eslint.js src/apps/equation-village src/lib/copy.ts src/apps/registry.ts
npm.cmd run build
```

The no-isolate flag avoids an observed Windows Vitest temporary-cache problem. The first sandboxed build stalled; it was stopped and the local build retried outside that sandbox. That retry produced the unrelated TypeScript errors described above.

## Review boundary

This is the approved single-mission prototype. The 12-mission bank, polynomial district, classroom dashboard and publication remain later phases. No teacher dashboard or multiplayer claim is made. Browser device emulation does not measure performance on the school’s physical phones/tablets, and no classroom learning gains have yet been measured.
