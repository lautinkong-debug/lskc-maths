# Polynomial arcade upgrade — 24/10/2026
Owner requests: live 32-student/eight-group testing through all four levels; activatable skills inspired by NumSprite; colourful game layouts; start with whoever is present, including 1 vs 1 and solo practice. Earlier delegated implementation judgement applies. English UI, original artwork and public-code-only research remain.

## Play rules
Keep four-choice polynomial questions and four curriculum tiers. Each successful pair pull earns one shared energy (maximum six). At level 2, Power Pull costs two and adds two units to the next successful pull. At level 3, Anchor Shield costs two and blocks up to two units of the next opposing pull. At level 4, Team Surge costs four and doubles the next successful pull. Either partner may activate one skill per pair round. A server transaction validates level, energy, room status and current question. Duplicate activation is idempotent; a different second skill is rejected. Mistakes preserve armed skills. No timer, paid currency or random attack bonuses.

## Flexible attendance
Teacher starts when at least one student is seated. Only occupied, active seats must answer and acknowledge next. Empty teams are practice, and unequal teams display their actual sizes. New pupils may join during live/paused play; joining a pair whose round has already begun queues them for its next question. Empty groups can become active later. Membership/capacity/ownership checks stay server enforced. Existing rooms without new skill fields default to zero energy and no active skills.

## Visual direction
A colourful algebra island arena: violet #5B3FD6, aqua #16CDB8, coral #FF6B7B, gold #FFC857, ink #202153, sky #DDF3FF. Rounded Segoe UI/system display text, standard readable body and KaTeX maths. White question panels; saturated buttons with dark outlines and tactile shadows. Original SVG character crews and island scenery communicate team size and rope movement. Shared energy and skill buttons sit next to answers. Solo Quest uses distinct coloured battle destinations and lively guardians. Existing school header and textbook lessons remain intact.
Desktop: compact teacher overview retains eight cards at 1920x1080; student arena above a question and skill tray. Phone: arena, compact team status, large four choices, skill tray. Keyboard focus and reduced motion supported.

## Research evidence
Previously captured public NumSprite bundle 2nj9koqcd_bj_.js:1129-1131 charges the super meter after correct answers; 1233-1265 checks a full meter, consumes it and applies damage plus shield/heal/stun effects. This is static client evidence, not guest gameplay. Adapt the charge-and-choose loop with original rules and graphics.

## Verification
Complete baseline live simulation with 32 isolated browser contexts and 384 correct submissions across 12 rounds, eight deliberate mistakes/retries, refresh/rejoin and all four tiers. Then unit and emulator checks for skill costs, duplicate races, shield consumption, solo/unequal pairs, late joins and legacy rooms. Browser QA for solo practice, activations, multi-client shared state, phones and projector. Verify updated production release and rerun relevant live flows. No unrelated teaching-app changes.
