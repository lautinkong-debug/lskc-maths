# Execution ledger — difficulty and answer-time force
Base: 42445efe6b281eefda197a3e8b06c6aad18726d7.
Owner's latest steering supersedes the earlier no-speed-bonus rule. No reachable separate spec; the plan records the owner request and implementation decisions.

Pre-flight: server clock -> shared summary -> ForceMeter and score arithmetic; all use active elapsed milliseconds. Existing game goals and absent timestamps require legacy defaults. Browser tests derive expected power independently from reported elapsed time.
Task 1-3: implemented after failing timing tests. Initial full unit suite 1370/1370; demo emulator 5/5; TypeScript and scoped lint pass. Solo browser regressions 13/13 pass. Classroom run interrupted by very long wall-clock timeouts; not certified and will be rerun on final source.
Final review: fresh gpt-6-astra review found two Important compatibility defects; both reproduced by separate unit regressions (2 failed, 8 passed) before fixing.
Final: fixed old lobby starts and empty-side arrivals accidentally enabling timing. Presence of the persisted startedAt field distinguishes a timing-capable pair from a legacy pair. Legacy groups keep the 24-unit goal and no time bonus.
Final: fixed old result arithmetic. Reconstruct previous difficulty from completed-pull count, then recover skill addition from gross versus base power. Cases cover shield, boost, surge and a level boundary. Both regressions now pass; final full suite pending below.
Final: Ruling: production quota/live completion remains externally blocked until a fresh check succeeds. Cost: local passes cannot certify the live classroom matrix.
Final: Ruling: winning-screen retention of question feedback is unchanged; the result screen presents the winner. Cost: the final pull's detailed arithmetic is not retained on that screen.
Final: Ruling: final merged-source build/browser results are the parent's responsibility; failures block publication.
No deferred minors in the timing review. The prior arcade minor (old shield feedback lingering into the next question) is superseded by the new resolved-only breakdown and reset on Next.

Task4 local complete: final source 4294e36; unit 1372/1372, emulator 5/5, classroom 5/5 including 32 independent clients / 384 correct, solo 13/13, types/lint/build and rendered QA pass. Both review regressions RED then GREEN; complete final suite passes. Fresh production public read still 429; publication readiness established, live matrix pending quota.
