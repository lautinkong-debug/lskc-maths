# Equation Village — reference analysis and proposed game

Date: 26/10/2026. Status: **Stage B approved and implemented locally; awaiting owner review of the prototype**.

## Recommendation

Build **Equation Village: Restore the Harbour**, an original miniature 3D town for F1 **1A04 — Linear Equation in One Unknown**. Students repair gates, lifts, bridges and a lighthouse by making valid algebraic transformations. The operations they choose change visible objects in the scene while ordinary written working remains legible.

Start with one beautifully finished bridge mission. Review its actual appearance, mathematical meaning and controls before expanding to a 12-mission solo game. Add a polynomial workshop later under **1A10 — Manipulation of Simple Polynomials**, with a separate learning objective.

This complements the existing polynomial Quest, Polynomial Tug and algebra-simplification work. It does not replace their routes or assume their live status from older memory.

## What was investigated

Reference: [BAFS Valley](https://bafs-valley.netlify.app/), inspected on 26/10/2026.

- Browser observations: three introduction screens, the actual 3D town, entry to the first shop, its two-choice question and explanatory hint, then return to the town.
- Observed resource inventory: three cover/guide JPEGs, a Three.js module, separate world/material/prop/character/effects modules, and a GLB asset request.
- Static inspection: eight public application JS/CSS files saved with SHA-256 hashes in `out/bafs-valley-research/source-manifest.json`. Code was inspected as data, not executed as a local program.
- Local screenshots: `out/bafs-valley-research/town-runtime.jpg` and `lesson-with-hint.jpg`.
- Scope limits: this was a targeted public-source and browser investigation, not an audit of every level or its backend. I did not register a named player or submit quiz answers. A visible leaderboard count does not establish learning effectiveness. The cover-image creation process is unknown.
- The reverse-engineer-anything skill guided evidence handling. Its MCP tools were absent from this session; these findings come from ordinary source inspection and browser observation, not REA Evidence records. A read-only CLI diagnostic also reported missing Codex registration and a Node version below the latest REA package requirement. No client configuration or runtime was changed; neither repair was needed for this public-source investigation.

## Why the graphics work

The attractive result comes from several coordinated layers. Three.js supplies rendering; the design choices make the town appealing.

| Layer | Verified evidence | Design lesson |
| --- | --- | --- |
| Strong first impression | The introduction uses a separate `bafs_valley_cover_hero.jpg`; the playable town is a WebGL canvas. | Plan both a polished cover and a convincing playable scene. Judge gameplay quality using gameplay screenshots. |
| Miniature-world camera | `main.js:82-116` creates a Three.js renderer, perspective camera, camera rig, world builders and postprocessor. The default path selects a following camera. | Use a deliberate elevated camera with a readable route and clear destination; limit unnecessary camera movement while solving. |
| Rounded, tactile forms | The browser shows chunky trees, small shops and rounded characters. Materials and props are built in dedicated modules, with a supplementary GLB loader. | Keep one shape language, consistent proportions and a small reusable prop kit. A collection of unrelated decorative assets will not produce this coherence. |
| Carefully controlled surfaces | `environment_materials.js` generates grass, wood, sand and other textures with CanvasTexture and uses clay/satin-style physical materials. | Add restrained texture and variation to otherwise simple forms. Avoid shiny plastic everywhere. |
| Soft, warm lighting | `world_curve_engine.js:1061-1084` configures warm sunlight, hemisphere fill and ambient light; `main.js:90-91` enables soft shadows. | Shadows anchor the objects, and softer fill keeps faces readable. Light the complete scene as one composition. |
| A gently curved horizon | The default follow preset has nonzero curvature; the shader bends distant world positions (`world_curve_engine.js:148-167,662-670`). | A shaped horizon contributes to the miniature-world feel. It is an optional polish feature, not essential to the algebra prototype. |
| Finishing effects | `fx_audio_ui.js:68-126` configures contact shading/SSAO, subtle bloom, tilt blur and colour grading. The normal main render path uses this postprocessor. | Apply restrained finishing after the basic scene looks good. Keep mathematical text in sharp HTML overlays. |
| Small signs of life | Character code includes blinking, breathing, walk bounce and reactions; environment code animates water, fruit and fish. | A few well-timed movements can make a small scene feel inhabited. Pause distracting ambient motion during reasoning when needed. |
| A coherent interface | Cream panels, rounded shapes, colour-coded actions, progress markers and location labels are visible in the browser. | Match the interface to the world while keeping the primary action and mathematics clear. |

The effects above are **source-configured defaults**, supported by visible rendering; they were not individually measured through GPU instrumentation. The code can disable postprocessing on failure. The audit distinguishes active setup from comments: for example, a comment mentions 4x MSAA while the offscreen target actually sets `samples = 0`.

Public evidence URLs: [main](https://bafs-valley.netlify.app/src/main.js?v=29), [world/camera/light](https://bafs-valley.netlify.app/src/world_curve_engine.js?v=29), [materials](https://bafs-valley.netlify.app/src/environment_materials.js?v=29), [props](https://bafs-valley.netlify.app/src/props_furniture.js?v=29), [characters](https://bafs-valley.netlify.app/src/characters_anim.js?v=29), [effects](https://bafs-valley.netlify.app/src/fx_audio_ui.js?v=29), [styles](https://bafs-valley.netlify.app/styles.css?v=29).

## Engagement lessons and changes for mathematics

The reference provides a role, recognisable destinations, visible progress, optional exploration, tools, collections and a next destination. These are plausible incentives to continue; inspection alone cannot prove they improve learning.

The first shop I inspected presents a subject question in a panel above the town. For Equation Village, the central activity will also alter the world: the mathematical representation is the device being repaired.

- **Purpose:** a resident needs a working bridge, lift or light. The student can see the unfinished object.
- **Agency:** choose between two unlocked repairs or choose a cosmetic decoration after a learning milestone.
- **Visible progress:** repaired structures remain restored; the town gradually becomes brighter and more active.
- **Competence:** early guidance makes a first success reachable, then support fades so independent success means something.
- **Recovery:** a specific explanation, visual correction and similar retry follow an error. No lost lives or long punishment animations.
- **Classroom focus:** travel can be skipped; rewards are brief. No daily streak obligation, speed-based mastery gate or chance-based reward system is needed.

Completion with help and independent success are recorded separately. A hint does not remove the student's restoration reward; a later unassisted retry can establish mastery.

## Art direction for our game

An original **coastal model village**, with a small footbridge, waterwheel, workshop and lighthouse. Use rounded timber, cream stone, soft foliage, calm water, warm sunlight and one memorable original bird mechanic. Optional local details, such as a harbour ferry, can give the setting a Hong Kong connection.

Keep the school header and navigation, Spectral/IBM Plex Sans typography, and clear paper/navy mathematical panels. Inside the game scene, propose a contained extension to natural scenery colours. This is an explicit proposed change to the current game-palette convention, included in the owner's design review.

Asset plan for the first scene:

- One original character with idle, encouragement and celebration states.
- One bridge with broken and restored states; two algebra trays; unknown capsules and signed unit tokens.
- A reusable tree, rock, planter, lamp and water strip; coherent materials and shadows.
- Three essential action animations: remove matching quantities, split equal groups, restore the bridge.
- One original cover composition derived from the actual game's appearance after the scene is approved.

Build the simple meshes and materials specifically for this game. Any later imported art must be original or appropriately licensed, with provenance recorded. The reference's characters, cover, GLB assets and source are research material, not production assets.

The first review must show the actual rendered game. A beautiful title illustration is not the acceptance test for the playable world.

## One complete mission

**Bridge Engine:** `2x + 3 = 11`.

1. The mechanic explains: “The bridge needs two equal power cells. Find the power in each cell.” Two identical `x` capsules and three unit tokens face eleven unit tokens. The equation is displayed above them.
2. The student chooses **Subtract 3 from both sides**. Matching tokens leave both trays together. The written working adds `2x = 8`.
3. The student chooses **Divide both sides by 2**. Both representations split into two equal groups. The working adds `x = 4`.
4. The student checks the original equation: `2(4) + 3 = 11`. The engine starts and the bridge unfolds.
5. A short new question, such as `3x + 2 = 17`, checks transfer with less visual support (`x = 5`).

Prototype feedback includes a broken-step repair: if only one side was changed, show “Apply the same operation to both sides to keep the equation equivalent”, identify both sides and let the student correct it. The first guided controls can link both sides; later missions require the learner to choose the operation and amount.

Students can tap or use the keyboard for every action. Dragging is optional. Keep each transformation synchronised with the written equation, with replay and a reduced-motion equivalent. Accept a valid alternative method, even when it is longer than the suggested route.

## Learning sequence

The local department topic list establishes the F1 placement. EDB's [KS3 explanatory notes](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/ma/curr/EN_KS3_e.pdf), printed p.19, support the balance principle, meaning of a solution and contextual equation formation; the introductory unit considers equations with one solution.

| Area | Three proposed missions | Main understanding |
| --- | --- | --- |
| Garden gate | `x + 4 = 9`; `x - 3 = 5`; `x + 6 = 10` | Inverse operations and equality |
| Harbour lift | `3x = 12`; `x/2 = 5`; `5x = 15` | Equal groups; multiplication and division |
| Bridge engine | `2x + 3 = 11`; `4x - 5 = 15`; `3x + 2 = 20` | Choose and justify two steps |
| Lighthouse circuit | `x - 4 = -7`; `2x + 3 = -5`; `3x - 4 = -10` | Signed quantities and zero pairs |

Independently checked solutions in row order: `5,8,4`; `4,10,3`; `4,5,6`; `-3,-4,-2`.

The 12 missions form the bank, not a requirement to finish all 12 in one short lesson. Guided, partially supported and symbolic versions should use fresh values where appropriate. The contextual bridge task introduces formulation; a later final repair can require building the equation independently.

Teacher-selected extensions, after the core pilot: unknowns on both sides (`4x + 2 = 2x + 10`), brackets (`2(x + 3) = 14`), and fractional solutions. Identity and no-solution cases stay outside the first release. Confirm alignment with the teacher's textbook before expanding; these authored examples are not represented as textbook transcriptions.

Use **signed energy tokens**, not literal negative masses, for negative quantities. Labels and shapes must convey sign and term type as well as colour. Explain that the equal-cell model means every occurrence of the same unknown has the same value.

## Mathematical and feedback requirements

The mathematics engine is independent of rendering. Represent both sides as exact affine expressions with rational coefficients. Check permitted operations, reject division or multiplication by zero as a reversible solving step, and verify the final solution by substitution into the original equation. Do not reuse expression equivalence as if it proved equation equivalence.

| Error or behaviour | Response |
| --- | --- |
| Changes one side only | Highlight the unmatched operation; explain preservation of equality; undo and retry. |
| Treats `3x` as `x + 3` | Show three identical capsules; explain “three equal copies of x”. |
| Divides only one term | Animate the division over the entire side and display brackets in the working. |
| Undoes subtraction with another subtraction | Show the additive inverse and a labelled zero pair. |
| Uses a valid but inefficient method | Accept the step; offer an optional next-step hint. |
| Guesses the correct value | Require substitution, then a fresh transfer item before recording independent mastery. |

## Classroom use and evidence

Suggested 18-minute lesson: 2 minutes for three entry questions; 3 minutes for teacher demonstration; 8 minutes for an appropriate subset of missions; 3 minutes for a contextual final repair; 2 minutes for fresh exit questions.

Keep engagement and learning measures distinct:

- Engagement: starts, mission completion, voluntary retries and whether students choose another repair.
- Learning: new entry/exit items, valid intermediate steps, hint use, independent success and a short delayed check next lesson.
- Usability: time to first meaningful action, navigation confusion and difficulty reading or operating the maths.

A small pilot can test whether the game is understandable and motivating. A single class's pre/post improvement does not, by itself, establish a causal effect of the game. Retention and transfer matter more than time spent collecting items.

The first prototype and solo pilot store progress on the device, with no live teacher dashboard. A later classroom phase may provide a teacher-only summary of misconceptions and a cooperative restoration meter. It must test independent students and real concurrent device flows; a shared screen simulation is insufficient.

## Implementation fit

Proposed route: `/apps/equation-village`; app folder: `src/apps/equation-village/`; topic: `1A04`.

- React/TypeScript and existing KaTeX/Math, PresentationFrame, app registry and central English copy.
- Direct **Three.js**, plus its required TypeScript declarations, proposed as new dependencies. They are absent from the current package manifest. Add them only after this concrete scope is approved under `CLAUDE.md`.
- A client-only, lazy-loaded world layer; pure equation/state logic remains testable separately.
- Reuse the existing progress/feedback design where appropriate, without coupling the renderer to Polynomial Tug's multiplayer backend.
- Read the installed Next.js guides before implementation. Preserve existing unrelated local changes.
- No Firebase data writes for the solo prototype; use the demo emulator for site integration. Classroom integration, if requested later, uses the existing server-marked architecture.
- Prefer a small camera-guided scene first. Free roaming, complex pathfinding, heavy postprocessing and additional districts follow only if they improve the approved experience.

## Stages and review gates

| Stage | Deliverable | Acceptance and decision |
| --- | --- | --- |
| A — current | Reference evidence and this plan | Owner selects the proposed game direction and first-stage scope. |
| B — first build | One complete, polished bridge scene; one character; `2x + 3 = 11`; misconception repair; a fresh transfer item; sharp maths panels; keyboard/touch and low-motion support | Owner reviews actual graphics and teaching interaction locally before expansion. |
| C — solo pilot | Four repair areas and 12 authored missions, local save/reload, teacher presentation and gradual removal of scaffolding | Check every solution, correction, progress record and layout; classroom pilot. |
| D — optional expansion | Polynomial workshop and/or authenticated class restoration mode | Separate scope approval; preserve independent learning and validate separate clients. |
| E — publication | Scoped release of the approved implementation | Owner-authorised deployment followed by live route and device checks. |

Stage B quality checks:

1. Correct transformations and substitution, including valid alternative paths and invalid zero operations, independently tested.
2. One correct full run, one misconception recovery, one hint-assisted run and one symbolic transfer run verified in the browser.
3. No duplicate rewards from double taps; save/reload and separate browser storage behave predictably.
4. At 360/390px and 1920px, equations and controls fit; projector type is legible; labels do not depend on colour.
5. Keyboard operation, sound off by default, reduced motion, WebGL failure fallback and no obscured controls.
6. Target smooth interaction on a representative school device: aim for at least 30 fps during normal play, with quality reduction when needed. This is an acceptance target, not a measured result. Test a physical school device before claiming it.
7. Load only the required scene assets; measure load time on the school's network; keep existing textbook and polynomial routes working.

## Concrete approval requested

Approve **Stage B only**: the equations bridge prototype, original coastal miniature art inside the game, and adding Three.js with its TypeScript declarations. The natural scenery palette is limited to the game world; school navigation and maths panels retain their existing identity. Expansion and publication follow later review.

The owner approved Stage B with “go”. The first local prototype and approved dependencies are now implemented. See `docs/equation-village-verification.md` for checks and limitations. No production write or deployment has been performed.
