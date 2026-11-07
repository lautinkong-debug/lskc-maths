# Adding a Web App

Each teaching tool has its own folder. The index page and `AppHost` read `registry.ts`. The server route reads `appRoutes.ts` instead, so that each app page downloads only its own code.

1. Create `src/apps/<slug>/index.tsx` as a default-exported client component. Keep the maths and interaction inside that folder; apps do not use Firebase.
2. Add `Thumbnail.tsx` in the same folder. Export a small SVG React component with a `className` prop. Use the existing colour tokens.
3. Add the tool's English wording in `src/lib/copy.ts`, then add one entry in `registry.ts` with its slug, title, topic, topicCodes, levels, strand, summary, thumbnail and `load: () => import("./<slug>")`. Add the slug and title to `appRoutes.ts` as well; a unit test fails if the two lists differ. Set `topicCodes` to the exact chapter codes from `docs/topics.md` (for example `["2A06"]`). The Web Apps topic dropdown reads the same live topic catalogue as Mistakes Book, including chapters with no apps; these codes associate each app with the appropriate chapters.
4. Check mouse or touch, keyboard controls, a 360 px viewport and Projection mode. Run `npm run lint`, `npm run typecheck` and `npm run build`.

`PresentationFrame` supplies `usePresentation()`. Its boolean value is true when the larger projection layout is selected, including when the browser cannot enter fullscreen.
