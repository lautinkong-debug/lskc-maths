# Circle Lab: Reason Challenge

## Teaching design

This replaces the three Circle Quest games with the teacher's four-part numerical task. The primary learning objective is distinguishing similar reasons by their direction: what is given, and what follows from it.

Every mission asks for these four decisions, in this order:

1. The value of x.
2. A necessary condition.
3. The relationship to establish before finding x.
4. The single circle reason directly connecting the givens to that relationship.

The bank contains all 17 chapter reasons, with three numerical variants each. Similar reasons appear together: perpendicular to a chord versus the midpoint converse, equal chords versus equal distances, a semicircle theorem versus its converse, and the directions connecting equal arcs, angles and chords. Choices are shuffled once per question and stay in place while answering.

An incorrect reason receives feedback identifying its required givens and its direct conclusion. Feedback does not claim that a different, longer valid proof is mathematically false. The completed working begins with the full givens and writes the target with its named reason using ∵ and ∴. Diagram measurements are schematic; supplied facts determine the answer.

Reasons are played as tappable skill cards. The diagram's conclusion stays locked until the checked condition, target and reason are all correct. Correct reasoning with incorrect arithmetic unlocks the relationship but does not complete the mission; the student still repairs x. The four locks only open for checked correct decisions, not merely filled fields. A first-try independent four-part success extends a Perfect chain; errors, expiry, helped answers and retries break the current chain while keeping the best record. No lives or learning access are removed.

## Levels and scoring

| Level | Reasons | Questions per round |
| --- | --- | --- |
| Chords and mid-points | 16.1–16.5 | 5 |
| Circle angles | 16.6–16.9 | 4 |
| Arcs, chords and angles | 16.10–16.15 | 6 |
| Arc ratios | 16.16–16.17 | 2 |
| All reasons mixed | 16.1–16.17 | 17 |

All levels are available immediately. Each question awards 20 points for its value, 20 for its condition, 30 for its target and 30 for its reason. A numerical answer alone cannot complete the mission. Retrying can improve the best score without accumulating duplicate points. Solved counts describe these exercises, not proof of long-term mastery.

Practice is untimed. Speed choices give 120, 90 or 60 seconds per question. An independent first-try correct argument earns a remaining-time bonus of at most 20 points, normalised across the three paces so the longest timer does not grant an unfair scoring advantage. A started deadline continues through question navigation and reload. At expiry the student can retry the timer or continue in practice, retaining their choices.

## Navigation and preservation

Previous, Next and numbered question buttons make Q1 available throughout a round. Drafts, submitted answers and feedback are preserved when navigating, changing activities and refreshing. Levels opens the setup screen; Resume saved level reopens the current round. Selecting a different level or pace starts a separate round. Best results are local to the browser.

The removed Quest screen migrates to Reason game. Its old game scores are not treated as completion of these new questions. Existing Explore constructions, recorded circles and pen drawings are preserved.

The pen toolbar uses the requested light-blue background and remains directly above the circle. Length and angle visibility controls remain independent. Full-chord labels explicitly name AB and CD, while the centre, midpoint, numerical and right-angle labels have separate positions.

## Verification, 31/10/2026

- Circle unit suite: 672 tests in 23 files passed, including all 51 numerical cases and the new session validation tests.
- Whole-project TypeScript and Circle-scoped ESLint passed.
- The isolated Next.js production build passed with the final game mechanics. A prior sandbox run compiled successfully but could not create a generated output directory; rerunning outside the filesystem sandbox passed.
- The maintained four-step browser regression passed: independent grading, draft and submitted Q1/Q2 navigation, refresh, and correction of a wrong reason.
- Student-flow browser checks completed all 17 reasons and all five level sizes. Checked wrong value/condition/target/reason separately, duplicate-score protection, fixed deadlines, timeout and practice recovery.
- Game-mechanic checks confirm that wrong reasoning keeps both the conclusion and diagram emphasis locked, while correct reasoning with wrong arithmetic unlocks the relationship without completing the mission. A 16-answer independent chain survived revisiting/reloading solved questions without inflation; timed scoring respected the 120-point total maximum.
- Layout checks used 360/390 px phone emulation and 1640 px desktop. A separate audit covers all 51 question diagrams, with rendered text bounds and visual review of the labels.
- Toolbar checks verify the light-blue colour, position above the circle, pen/move controls, and independent length/angle visibility through refresh.

Browser emulation is not a physical-phone test. No classroom backend or student-data upload is introduced.
