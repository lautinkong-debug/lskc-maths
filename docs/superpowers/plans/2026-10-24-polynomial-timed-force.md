# Difficulty and answer-time pulling force
Owner steering: pulling force depends on question difficulty and answering time. This supersedes the earlier no-speed-bonus rule. Continue the approved colourful multiplayer release and defer publication until this addition is verified.

## Design
Base force is difficulty 1–4. Add +2 if the whole active pair finishes first-try correct within 20/30/40/50 seconds at levels 1/2/3/4; add +1 within 40/60/80/100 seconds; otherwise +0. Wrong attempts remove this round's speed bonus. No timeout removes the question or base reward. Power Pull adds 2; Team Surge doubles base plus time bonus; Anchor Shield blocks up to 2. Feedback shows the full arithmetic.

Only server time determines scoring. Pair clocks start at teacher Start, at an empty team's first live arrival, or when every active member acknowledges the next round. Timed rounds queue later partners until the next question. Teacher pauses are subtracted using the room's cumulative pause duration. Duplicate submissions cannot reroll a time bonus. Reads remain observational: no extra write per poll. Legacy matches retain their 24-unit goal and untimed current game; new matches use 48 units so a fast solo pupil still reaches level 4. Rope graphics scale to the match's goal.

## Tasks
- [x] Reproduce unit cases for time boundaries, slower partner, wrong retry, pause exclusion, skills, queued joins, fresh round start, forged time and legacy defaults.
- [x] Implement browser-safe timing constants, authoritative room clock, pair timestamps/result breakdown, start/join/next clock transitions and pause/resume bookkeeping.
- [x] Show elapsed team time, current time bonus, targets, and difficulty/time/skill/shield breakdown; update rules and tests.
- [ ] Verify units, emulator timing/pauses/concurrency and browser flows; full 32 independent students through all four levels with every skill, retries and correct server-timed score accounting. Run a fresh timing-scope review, final build/types/lint and visual checks. Publish through the existing Git integration only after these pass; live matrix still depends on production Firebase quota.

## Review focus
Time must not be supplied by clients, reset by refresh/skill/retry, include teacher pauses, or run before a question is active. Existing correct partner answers persist. Mixed cached room/match revisions cannot terminate polling before accepted terminal state. Correctness-first bonus eligibility and cumulative force must match feedback. Legacy goal and clock defaults must remain safe. No extra Firestore writes on reads.
