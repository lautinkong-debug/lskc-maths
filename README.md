# LSKC Mathematics

Website for the Mathematics Department of S.T.F.A. Lee Shau Kee College
(順德聯誼總會李兆基中學).

- **Web Apps** — interactive teaching tools for the classroom projector and for
  revision on a phone.
- **Mistakes Book** — teacher-uploaded correction notes (PDF / DOCX / HTML),
  organised by level and topic, in a student edition and a teacher edition.

## Running it on this computer

You need **Node.js** and **Java** installed (Java is what the Firebase
emulators run on). Both are already set up on the owner's machine.

```bash
npm install     # first time only
npm run dev:all # website + Firebase emulators together
```

Then open:

| what | address |
|---|---|
| the website | http://localhost:3000 |
| Firebase emulator control panel | http://localhost:4000 |

Press `Ctrl` + `C` in the terminal to stop both.

To run just one of the two: `npm run dev` or `npm run emulators`.

## Other commands

```bash
npm run build       # production build
npm run lint        # check code style
npm run format      # auto-format code
npm run typecheck   # check TypeScript types
npm run test        # unit tests
```

## Where things are

| file | what it is |
|---|---|
| [CLAUDE.md](CLAUDE.md) | how this project is built — rules, security model, design direction |
| [PLAN.md](PLAN.md) | the plan, phase by phase, with what to test after each one |
| [docs/topics.md](docs/topics.md) | the topic list (F1–F6), used to seed the database |
| `.env.example` | every setting, explained. Copy to `.env.local`. |

Deployment instructions for Firebase (creating the project, Google sign-in,
the Blaze plan and budget alert, connecting GitHub to App Hosting) are written
in Phase 8 and will be added here.

## Safety while developing

`npm run dev:all` talks only to the **Firebase Emulator Suite** running on this
computer, under a fake project called `demo-lskc-maths`. Nothing you do locally
can reach or damage a real Firebase project.
