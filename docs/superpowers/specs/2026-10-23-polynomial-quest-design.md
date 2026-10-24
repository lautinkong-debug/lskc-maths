# Polynomial Quest — first local game

Date: 23/10/2026. Status: design approved, implemented and locally verified. The owner delegated remaining implementation choices. Local preview: `http://localhost:3028/apps/polynomials#play`. Evidence: `docs/polynomial-quest-verification.md`.

Design checks: a fresh independent builder review reported “nothing important left”. All four example answers below passed the existing exact symbolic-equivalence evaluator. These are design checks, not evidence of an implemented or tested game.

## Intent and confirmed direction

The owner requested a polynomial game after an investigation of NumSprite, then selected **Polynomial Quest — battles and skill progression** from three game styles. Build an original F1 polynomial adventure within LSKC Maths, with correct mathematics, meaningful correction feedback and a complete playable loop.

NumSprite supplied the broad inspiration: answer questions, see a battle response, progress through skills, and revisit weaker skills. Its code, characters, artwork, question bank and services will not be incorporated. The owner's earlier public-code-only restriction remains in force for that investigation.

The owner approved the design below and authorised implementation using the builder's judgement.

## Approaches

1. **Polynomial Quest, selected:** battles connect short algebra practice sessions and visible skill progress. This best matches the NumSprite reference; the mathematics must drive the action.
2. **Polynomial Lab:** manipulation of algebra tiles would expose meaning directly, but would place more emphasis on modelling and dragging than the requested battle progression.
3. **Error Detective:** repairing worked solutions targets misconceptions effectively, but offers a different core activity. Misconception-specific feedback will instead support Quest.

Integrate Quest as Play beside the existing textbook lessons in `/apps/polynomials`. A separate app would duplicate navigation; replacing the textbook page would discard useful teaching work. Keep the existing registry entry and lesson URLs.

## Pilot scope and success

Deliver one complete four-stage game, not placeholder stage cards. The scope is F1 `1A10`, univariate polynomials in x, integer coefficients, maximum degree two. The first three stages are available immediately, with a recommended order; completing all three unlocks the mixed boss. Each stage has six rounds and can be replayed with new questions.

| Stage | Question coverage within its six rounds | Example and independently checked result |
| --- | --- | --- |
| Term Collector | Two linear, two quadratic and two cancellation cases; combine matching powers without altering powers | `3x² + 5x − 2x² + 4x = x² + 9x` |
| Sign Guardian | Two linear and four quadratic subtraction cases; include negatives inside brackets | `7x − (3x − 5) = 4x + 5` |
| Expansion Gate | Two monomial distributions, two binomial products, two binomial squares | `(x + 3)(2x − 1) = 2x² + 5x − 3` |
| The Polynomial Guardian | Two expanded-product/subtraction combinations, two outside-minus squares, two mixed collect-and-expand questions | `2x² − (x + 4)² = x² − 8x − 16` |

Use original generated questions rather than transcribing the textbook bank into the game. Generated parameters must be small enough to favour algebra over arithmetic: starting coefficients from −9 to 9, nonzero factors where needed, binomial coefficients from −5 to 5, final coefficient magnitudes at most 99. Filter degenerate templates that remove their intended operation. Deliberate zero coefficients and zero answers remain valid in cancellation questions.

Success means a pupil can select a stage, choose answers, understand a correction, defeat its guardian, see an honest result, replay, and recover saved stage records after refresh. A teacher can project the game, use the keyboard, and return to the existing textbook lesson.

Beyond this pilot: multivariate polynomials, division, factorisation, timed modes, classroom multiplayer, teacher reports, online scores, avatars/equipment shops, currencies and daily rewards. These are not required for the first game.

## Player journey and battle rules

1. Open `/apps/polynomials#play` to a compact four-stop map. Each stop shows its skill, six-round length and best stars. Basic stages are freely selectable; the boss explains its three completion prerequisites.
2. Choose a stage. Show one short instruction: solve six rounds to break six shield segments. Explain stars before the pupil begins. All sessions are untimed.
3. Show the full question, four answer buttons and a compact arena together. The problem is the main visual element. An original geometric guardian has six visible shield segments, with a matching text count.
4. A valid correct submission clears one segment and advances the round only when the pupil presses Continue. It cannot apply damage twice. Brief original SVG/CSS effects celebrate the answer; they do not delay access to Continue.
5. An incorrect submission resets the clean-answer combo and opens specific feedback plus worked lines. The answer is now revealed, so submitting it again cannot clear the round. The action is **Try a similar question**, which generates a fresh, non-identical question from the same template and difficulty. Solving that fresh question clears the original round. Further mistakes repeat the explanation/retry loop. The pupil can return to the map at any time.
6. A Hint explains the key method without revealing coefficients in the final answer. The pupil may then solve the same question. Help is recorded for the round; it does not prevent progress.
7. Six cleared rounds defeat the guardian and produce a result screen. There are no player lives, countdown attacks or penalties for taking time.

Round states: question → correct feedback → next round; or question → correction → fresh recovery question. Completion is possible only after six solved rounds. A fresh recovery question has its own question ID and answer but remains attached to its original round for scoring.

The combo is a cosmetic streak of unaided first-attempt original rounds. Hint use or an incorrect valid submission resets it. Recovery successes clear shields but do not count toward that streak. No timed or combo damage multiplier changes the six-round contract.

## Multiple-choice answers and mathematical validation

Owner amendment, 23/10/2026: pupils find typing difficult, so replace the coefficient fields with multiple choices throughout all four battles. The builder's chosen interaction is four large buttons labelled A–D, in a two-column desktop grid and a single phone column. Tap once to submit; keyboard users can Tab and press Enter or Space. No typing or additional Check step is required.

Every question has four mathematically distinct canonical expressions and exactly one correct option. Include deliberately modelled sign/middle-term mistakes when available, then fill with sign, omission and nearby arithmetic distractors. Linear prompts retain linear distractors. Shuffle deterministically by question ID: the correct letter varies across questions, and options remain stable through hints, rerenders and map/resume.

Canonical choices omit zero terms, suppress coefficient 1 on variable terms, render signs correctly and show `0` for the zero polynomial. Compare the selected coefficient vector exactly. After submission, disable all choices and visibly label **Your choice** and **Correct answer**; retain the existing worked-feedback and fresh-question recovery flow. Scoring and saved records remain unchanged.

## Explanations and correction

Each question carries an expression structure, exact answer vector, skill/template ID, ordered mathematically equivalent working lines and hint. Work is generated from the same parameters as the question. Preserve the entire equality at every line, especially an outside minus while expanding a square.

- Like terms: group the x², x and constant terms with written labels and visual emphasis; add their coefficients. Explain explicitly that x² and x are different kinds of term.
- Subtraction: highlight the outside minus, then display every changed sign before collecting. A recognised partial sign flip receives a specific explanation.
- Products: show all factor pairs in a small distribution grid, then collect the middle terms. A square shows both cross products. Recognised omission of the middle term receives specific feedback.
- Mixed questions: expansion, bracket removal, grouping and simplification remain separate completed lines.

Only claim a specific misconception when the selected coefficient vector exactly matches a deliberately modelled error. Otherwise identify the differing terms, give the relevant general method, and show the correct working. Never infer the student's thought process solely from a wrong answer. Correct answers also have an optional View working control.

The retry is a different expression with the same intended operation, not the already revealed question. Do not count a shown solution as an independent success.

## Stars, progress and saving

For each original round, record whether it was solved correctly on the first valid submission without a hint. This is a six-item denominator; recovery questions neither improve nor inflate it. A hint on a recovery question has no additional scoring effect.

- One star: complete all six rounds, using help/recovery as needed.
- Two stars: at least four of the six originals correct first time without help.
- Three stars: all six originals correct first time without help.

The result says **Solved without help: N / 6** and **Rounds practised with help: (6 − N) / 6**, alongside stars. These are supported/unsupported completion measures, not a claim that a single game establishes mastery. Showing a valid incorrect answer or using Hint marks that original round as supported for its remaining lifetime.

Persist a small versioned local record under a new polynomial-specific key: stage completion, best stars and best unaided count. Store aggregate stage records only, with no names, account IDs or textbook progress changes. A replay may improve a best result, never lower it. Apply completion once per session ID and merge stage maxima with the latest stored record; handle a storage event from another tab. Corrupt or unsupported storage data falls back safely, and storage failures show **Progress cannot be saved on this device** while leaving gameplay usable.

Reload restarts an unfinished battle at the map; say so in the map's brief save note. Completed records survive. Switching Learn/Play retains the current unfinished game during the same mounted app session; timers and input handling cannot keep running in the hidden mode. A return to map during a battle preserves it for Resume, with a separate Start again action. No confirmation is needed to leave the page; there is no hidden promise to restore unfinished rounds after refresh. A local Reset game progress action has an inline confirmation and affects only this game's key.

## Screen and visual direction

Use the site's exercise-book palette, Spectral headings, IBM Plex Sans controls and KaTeX. The scene is an algebra adventure drawn on graph paper: an original polygon guardian, six shield segments and precise algebra marks. Use navy for structure and crimson for emphasis; do not rely on colour alone for signed coefficients, correctness or progress. Artwork must be original and contain no NumSprite likenesses or assets.

Desktop: stage/round strip, compact arena, large question, coefficient controls, feedback beneath. Map navigation remains secondary. On a 360px phone, the arena compresses before the question and fields; feedback is in normal document flow. Maths containers may scroll internally if necessary, but the page must not overflow horizontally. Projector mode enlarges the question and keeps the answer controls and active feedback clear at 1920 × 1080. A result screen must fit sensibly without a large empty victory panel.

Controls have visible focus and comfortable touch targets. Use text labels with progress graphics, an accessible feedback live region and intentional focus movement after checking, continuing or entering recovery. No autoplay audio or flashing; respect prefers-reduced-motion by removing travel/shake effects while keeping immediate state changes. Native buttons provide the complete keyboard path. No drag operation is required.

## Integration and implementation boundaries

Current verified source has expanded beyond the earlier Q34(b) pilot: the polynomial entry point imports `bank.ts`, `PilotLesson`, `GenericLesson` and the lesson picker. Preserve that current work and all textbook hash links. Re-read the actual files before applying narrow integration edits, since other tasks share this checkout.

Put game components, generation, state transitions and persistence in `src/apps/polynomials/quest/`. Use the existing polynomial entry point to select Learn or Play using the hash. `#play` opens the map; textbook hashes keep their existing meaning. Browser back/forward must update the active mode correctly. Treat malformed play links safely. Keep the default route on Learn so existing lesson entry behaviour is preserved.

Use the existing `LessonWorkspace`, `usePresentation` and Math component. Add English game wording to a dedicated `copy.polynomialQuest` section in `src/lib/copy.ts`. Keep technical IDs and mathematical data in the game engine. Leave the question-bank data and textbook solution engine untouched except for the necessary mode host integration. Update the existing registry summary to mention Play when the pilot is implemented.

Game logic is pure TypeScript; components use local state and browser storage only. No Firebase import, backend, security-rule change, new dependency, site deployment, push or publication is needed. Use the installed Next 16 documentation, React conventions and repository checks. Keep changes uncommitted for the owner's local pilot review unless asked otherwise.

Builder discretion: exact guardian silhouettes, microcopy, CSS composition, component boundaries, deterministic generator/PRNG implementation and numeric animation durations. Do not change the question coverage, round/scoring semantics, answer contract or local-only delivery under that discretion.

## Verification and review boundary

- Independently validate many generated questions per template using an exact coefficient evaluator separate from the generator's answer calculation; check every completed working line, including cancellation, negative factors and outside-minus squares. Verify seed reproducibility and distinct recovery prompts.
- Independently check all four choices for zero/negative/unit coefficients, duplicate expressions, exactly one correct option and varied answer positions. Test hint and recovery scoring, six-round completion, boss unlock, repeated submission, record merging and corrupt/blocked storage. Use tests of mathematical and player-visible behaviour, not snapshots that merely mirror code.
- Browser-check one complete perfect stage and one stage involving hints/mistakes/recovery, replay and refresh, all four stage templates, unlocks, keyboard/touch, reduced motion, navigation away/back and the existing textbook default/deep links.
- Inspect actual desktop, 360/390px phone, short landscape and 1920px presentation renders. Check that maths, inputs and feedback stay readable and no horizontal page overflow occurs.
- Run focused unit/browser checks, scoped lint/format, TypeScript and the production build; preserve unrelated work and coordinate isolated output folders/ports if another task is building. Record concrete results and known limits in `PLAN.md`.

Hand over a running local URL, short test instructions and verified screenshots after implementation. Stop at the completed local pilot for the teacher's review. Do not imply a public release or classroom mastery validation.
