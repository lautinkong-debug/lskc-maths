# Congruent Triangles games

The authorised addition adapts Similarity Studio's focused classroom: a large diagram beside the controls and proof, with the diagram first on phones. The existing Chapter 5 source record and solution data use exactly SSS, SAS, ASA, AAS and RHS. New questions are generated practice based on those conditions, not additional textbook transcriptions.

Five three-round activities change one stated measurement to repair a pair: third side (SSS), included angle (SAS), included side (ASA), non-included side (AAS), and hypotenuse (RHS). This construction is explicitly separate from moving, rotating and reflecting the diagram, which always preserve size. One shared drawing scale preserves differences between the triangles.

Students select the displayed facts and the condition that uses them directly, then reveal one proof line at a time with matching diagram highlights. A twelve-round mixed challenge includes all five conditions, AAA with unequal sizes, and an explicit ambiguous SSA pair. Feedback addresses the included angle, included side, right angle and hypotenuse misconceptions; retry is immediate and progress has no timer.

The games module owns local progress, sound (off initially), reduced-motion controls and its modal classroom. It has no Firebase calls or new dependencies. Public interface: default `CongruenceGames({ presenting?: boolean })`; `games/copy.ts` re-exports wording from `src/lib/copy.ts`. Geometry and grading are pure and checked independently against reconstructed lengths, angles, reflection invariance and every permitted control value.
