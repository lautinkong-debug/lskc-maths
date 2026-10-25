# Polynomial game bug audit — 25/10/2026

The owner requested two agents: one to find bugs and one to debug them. The finder reviewed tracked source without editing it; the debugger owns implementation and regression tests. The parent coordinates verification and integration.

Baseline: release `6dd30970e452044e4a6f14ff82f72ff375a7eb82`. The focused Tug baseline passed all 28 tests. Later origin/main changes through `fb6fcb7` concern Surface Area; the polynomial source is unchanged. Local tests use `demo-lskc-maths`.

## Confirmed findings

1. **P2 — Exhausting solo square-question variants freezes the browser tab.** The retry reducer searches indefinitely for a never-seen question, but this template has only 100 sources. Reproduced with real wrong multiple-choice submissions after four cleared rounds; retry 100 does not return. The fix must bound selection, permit recycling when necessary, avoid the immediately previous question, and preserve honest progression and stars.
2. **P2 — A stalled classroom request can disable controls indefinitely.** The answer may commit and appear through healthy polling while the original POST remains unresolved. The busy flag never clears, so the student cannot advance. An unresolved GET can also stop the polling loop. The fix must bound the complete request, recover safely when a mutation may already have committed, preserve revision checks, and prevent duplicate pulls.

Reproductions are retained under ignored `out/polynomial-bug-audit/`. The finder stopped the hung processes and closed its own test browser and local room. It found no additional confirmed scoring or mathematical defect in this bounded audit of timing, pauses, active seats, late joins, skills, legacy defaults, choices and progression.

## Verification status

The debugger bounded retry selection to 128 candidates, then recycles history while excluding the immediately previous expression. The original 110-retry reproduction now completes. A 15-second end-to-end request deadline covers auth, token refresh, transport and response-body reading. Timed-out work cannot send a deferred mutation after authentication resumes, and POST actions are not automatically replayed.

The finder independently reviewed both fixes and found no concrete regression. Current evidence: 1,377 unit tests across 51 files, five demo integration tests, TypeScript, scoped lint and the production build pass. Both new held-response browser regressions pass. Twelve solo cases passed in the initial run; the unchanged blocked-storage case then passed in isolation after initially remaining at the shared app-availability screen.

The first classroom run had two failures: the all-levels run stopped at one unanswered student in round 3, and the separate 32-identity API check saw a socket reset on a GET. Three existing flows passed. The saved room has an unanswered seat, so that first failure is not attributed to an incorrect option without evidence. The unchanged API case subsequently passed in isolation. The fully instrumented 32-browser rerun then passed all 12 rounds and four levels in four minutes, with 384 correct answers, eight recovery attempts, every skill, teacher-ended results and zero page errors (own room `W6H4VA`). These initial failures remain recorded rather than being presented as a clean first run.

The finder separately reproduced a real test-harness race: its response listener can receive the next question before React renders it; the answer helper reads old options, then Playwright waits and clicks that index on the new question. A controlled 2.5-second page-side Next-response delay produced the wrong submission with the new question ID. The helper now synchronises the rendered question and all four choices and checks the actual submitted ID and option, retaining the independent mathematics and score assertions. This proves the harness defect, not the cause of the original unanswered seat.

All seven classroom and all 13 solo browser cases passed across the recorded selections and isolated reruns. No automatic answer retries or weakened correctness checks were added. The final snapshot contains the exact application source; only the later test-harness instrumentation and this audit document differ. Logs and the successful classroom report are retained under ignored `out/`; the corrected preview remains available on port 3033.

## Release integration

The scoped fixes were integrated with the subsequent Surface Area and Similarity releases, then with `ebb2e08` (question search and keyboard skip navigation). The only rebase conflict was in PLAN.md; both teams' progress notes were retained. The game implementation files and game copy match the tested snapshot; the incoming polynomial index change adds the displayed textbook question label to search, and its shared-header change preserves lesson hashes when skipping to content. Those incoming changes have their own verification record in `docs/polynomials-bug-audit.md`. Integrated unit/type checks are rerun before publication. The existing GitHub-to-Vercel production integration will compile the combined release; deployment identity and public-page smoke evidence are kept under ignored `out/` after publication.

## External limitation

A fresh public read from production Firebase on 25/10/2026 still returned HTTP 429 `RESOURCE_EXHAUSTED: Quota exceeded`. Production load testing remains blocked. This audit does not change billing, security rules, or production data, and does not claim a live 32-student pass.
