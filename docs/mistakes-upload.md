# Upload mistakes from a topic

30/10/2026

Teachers can open **Manage → Topics** and choose **Upload mistakes** beside any chapter. The upload page selects that chapter and its current level, with **Student edition** as the default. Enter a title, choose a PDF, DOCX or HTML file (up to 20 MB), and choose **Upload book**. Students can find student editions under that chapter in **Mistakes book** and open or download the file.

The existing teacher-only management gate, upload validation, Storage and Firestore permissions, teacher-edition privacy, and file preview/download code are retained. The query parameters are matched against loaded topics; unknown topics leave an empty selection, and manually changing the level clears the previous chapter.

## Verification

- Production build, TypeScript, scoped lint and whitespace checks pass.
- Four Chrome scenarios pass on the production build against the local demo Firebase emulators: teacher-only access and F2 chapter preselection; actual HTML upload followed by a separate unauthenticated student finding and reading it; 390px phone layout; invalid/stale topic links.
- Screenshots: ignored `out/linear-equations/topic-upload-phone.png`, `topic-upload-form-phone.png`, and `student-mistakes-preview.png`.
- Run `node node_modules/playwright/cli.js test --config playwright.mistakes-upload.config.ts` with the emulator-backed release preview on port 3044. The suite refuses non-local test targets. The existing global setup seeds only `demo-lskc-maths`.
- The Storage emulator needs a Firestore connection for its real permission checks. This session reused the running Auth/Firestore emulators and attached the separate local Storage process to Firestore on 127.0.0.1:8080. No security rules or responses were replaced.

Test uploads are confined to the local emulators. No fixture documents are uploaded to the live website.
