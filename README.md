# LSKC Mathematics

The Mathematics Department website for S.T.F.A. Lee Shau Kee College. It has
interactive Web Apps and a Mistakes Book for PDF, DOCX and HTML correction notes.

## Latest official source — 11/10/2026

Use **`main`** for the complete current website:
[GitHub source](https://github.com/lautinkong-debug/lskc-maths/tree/main) ·
[Official website](https://lskc-maths.vercel.app).

This includes the Statistical Charts vocabulary and animated teaching activities,
editable frequency tables, textbook-topic filtering, and Directed Numbers textbook
practice, bird animation and sign/magnitude lessons. Read
[the Dot handoff](docs/dot-handoff.md) before continuing development.
Earlier feature branches are superseded; their commits remain in Git history.

## Run and test on this computer

Node.js and Java are already installed on the owner's computer. In **Windows
PowerShell**, enter these commands one line at a time:

```powershell
cd 'C:\Users\t28ltk\Projects\lskc-maths'
npm.cmd install
npm.cmd run rules:build
npm.cmd run dev:all
```

Open <http://localhost:3000> for the website and <http://localhost:4000> for
the Firebase Emulator UI. Leave that PowerShell window open. In a second
PowerShell window, run `npm.cmd run seed` after each emulator start to add
three local test accounts and the 69 department topics. The seeded password is
printed by the command.
Press `Ctrl+C` in the first window to stop the site and emulators.

The local `.env.local` uses `NEXT_PUBLIC_USE_EMULATORS=true` and the fake project
`demo-lskc-maths`. `npm.cmd run seed` refuses to run on any real project. Never
put real Firebase values into the local `.env.local` just to test the site.

Other local checks:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:rules
npm.cmd run build
npm.cmd run test:e2e
```

The rules test command starts and stops its own emulators. Stop `dev:all` first
if ports 9099, 8080 or 9199 are already in use. The end-to-end command likewise
starts its own website and emulators.

## Live Vercel deployment (06/10/2026)

Website: [lskc-maths.vercel.app](https://lskc-maths.vercel.app).
Firebase project: `lskc-maths-2026` (display name `LSKC Mathematics Dept Website`).
Firestore is in Hong Kong (`asia-east2`). Google sign-in uses the support email
`t28ltk@lskc.edu.hk`; Anonymous sign-in is enabled for public-mode challenges.
Both stable Vercel domains are authorised. The 69 topics from `docs/topics.md`
and the first admin record have been created; no emulator accounts were copied.

The Vercel project is `lskc-maths` in `lautinkong-4501`. It runs Next.js and
Node 24 server routes; `package.json` pins Node 24 to match Firebase Admin's
dependencies. `vercel.json` enables `--experimental-require-module`, which
Vercel disables by default and Firebase Admin's `jwks-rsa` dependency needs.
See [Vercel's module-loading guidance](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration).
Production and Preview have the six public Firebase web settings,
`NEXT_PUBLIC_USE_EMULATORS=false`, `NEXT_PUBLIC_ACCESS_MODE=public` and
`NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=lskc.edu.hk`.
`FIREBASE_SERVICE_ACCOUNT_JSON` is a separate encrypted Secret. Its service
account, `vercel-maths@lskc-maths-2026.iam.gserviceaccount.com`, has only
`roles/datastore.user`. The credential must never enter git or browser code.

The site was uploaded from this local checkout using `vercel deploy --prod`.
GitHub automatic deployments have not been connected. Keep `.env.local` on the
demo emulators; do not replace it with production settings.

Remaining launch work: the owner must enable Blaze billing and create a budget
alert, then create the Storage bucket, deploy Storage rules, set CORS for
`https://lskc-maths.vercel.app`, and enable the seven `expireAt` TTL policies
listed in PLAN.md. PDF uploads and automatic challenge deletion are not ready
until then. Verify real teacher sign-in, a test upload/download and a complete
class challenge before inviting students; check the school's privacy policy.

For later school-only access, update the access mode and allowed domains in
both Vercel Production/Preview and the local rule-build settings, rebuild and
deploy Firebase rules, then redeploy Vercel. Confirm the students' email domain
first. `apphosting.yaml` belongs only to the alternative hosting route below.

## Alternative: launch on Firebase App Hosting

These instructions make real Firebase resources and can incur charges. Keep
the demo emulator setup above for development. Record the **real project ID**,
**Storage bucket name**, and later the **live site URL** as you go. A project
name and a project ID are different; use the ID in commands.

Use a **dedicated Mathematics project**. Deploying these Firestore and Storage
rules to an existing project replaces its rules and could affect other apps
that already use that project.

### 1. Create the project, billing alert and databases

1. In the [Firebase console](https://console.firebase.google.com/), choose
   **Add project**. Create a separate Mathematics project and record its ID from
   **Project settings (gear) → General**. `demo-lskc-maths` is only local.
2. In Firebase, upgrade this project to **Blaze**. In the
   [Google Cloud console](https://console.cloud.google.com/), select the same
   project, open **Billing → Budgets & alerts → Create budget**, choose
   **Alerts only**, scope it to this project, choose a monthly amount around
   **HK$20** (or its equivalent in the billing account's currency), and enable
   email alerts. Save it and confirm it appears. An alert informs you of
   spending; it does **not** automatically stop charges.
3. In Firebase, open **Build → Firestore Database → Create database**. Use the
   default database, Standard/Native edition, a suitable nearby location, and
   **production mode** if offered. The rules deployed below replace its initial
   rules. Record the database location.
4. Open **Build → Storage → Get started** and create the default bucket. Record
   its exact name from the Storage screen. Do not upload school content while
   temporary default rules are in place.
5. Open **Build → Authentication → Get started → Sign-in method → Google**.
   Enable Google, set the project support email and save. Teacher access still
   requires a verified `lskc.edu.hk` account and an entry in `teachers`.

### 2. Check and deploy the security rules

From PowerShell in this repository, run the local checks first:

```powershell
cd 'C:\Users\t28ltk\Projects\lskc-maths'
npm.cmd run rules:build
npm.cmd run test:rules
```

The first command should print `Built public rules for lskc.edu.hk`; the second
should finish with all rules tests passing. The builder reads only the access
mode and allowed domains from `.env.local`; the fake local Firebase ID is not
used by the generated rules. Confirm `apphosting.yaml` also says `public` and
`lskc.edu.hk` before deployment.

Sign in to the Firebase CLI and list the projects your account can access:

```powershell
npx.cmd firebase login
npx.cmd firebase projects:list
```

Set the **real** ID recorded in step 1, check it printed correctly, and deploy
only Firestore rules/indexes and Storage rules:

```powershell
$firebaseProjectId = 'REPLACE_WITH_REAL_PROJECT_ID'
$firebaseProjectId
npx.cmd firebase deploy --only firestore,storage --project $firebaseProjectId
```

`firebase.json` points to `firestore.rules`, `firestore.indexes.json`, and
`storage.rules`. This command overwrites live rules, so inspect the project ID
and generated access mode first. It does not deploy the website. In Firebase,
confirm **Firestore Database → Rules/Indexes** and **Storage → Rules** show the
intended rules and indexes. Do not run `npm.cmd run seed` for production; it is
deliberately emulator-only.

### 3. Create the first admin

In Firebase, open **Build → Firestore Database → Data → Start collection**.
Collection ID: `teachers`. Document ID: `t28ltk@lskc.edu.hk` (lowercase).
Create exactly these fields, choosing the displayed Firestore types:

| Field | Type | Value |
|---|---|---|
| `name` | string | `Tin Kong Lau` |
| `isAdmin` | boolean | `true` |
| `addedBy` | string | `t28ltk@lskc.edu.hk` |
| `addedAt` | timestamp | current date/time |

Save and reopen the document to verify the ID and boolean type. This one
console-created document lets the first admin sign in; after that, use
`/admin/teachers` on the site to manage teacher accounts. A person merely
having a school email is not automatically a teacher.

### 4. Connect the tested GitHub branch to App Hosting

The public repository is
[lautinkong-debug/lskc-maths](https://github.com/lautinkong-debug/lskc-maths).
Make sure the latest tested phase commits, including `apphosting.yaml` and
`next.config.ts`, have been pushed to the branch you choose as the live branch.
Pushing to a connected live branch later triggers another rollout.

In Firebase, open **Hosting & Serverless → App Hosting → Get started** (or
**Create backend**). Choose a region suitable for Hong Kong users, connect
GitHub and select `lautinkong-debug/lskc-maths`, set root directory to `/`,
choose the live branch, create a Mathematics Firebase **web app** for this backend,
and finish setup. Wait for its first rollout to succeed. Record the
`https://…hosted.app` address shown in **Backend information**.

`apphosting.yaml` sets emulator use to `false`, access mode to `public`, and
teacher domain to `lskc.edu.hk`. App Hosting supplies the linked web app's
`FIREBASE_WEBAPP_CONFIG` during build; `next.config.ts` maps its six public
fields into the `NEXT_PUBLIC_FIREBASE_*` values the site uses. There are no
real project IDs or secrets committed to the repository. If the build reports
a missing web app config, check that a Firebase web app is linked to the
backend and start a new rollout; do not copy the demo config into hosting.

### 5. Authorise the live sign-in domain

In Firebase, open **Build → Authentication → Settings → Authorized domains →
Add domain**. Enter only the host part of the live address (for example,
`YOUR_BACKEND.hosted.app`, without `https://` or a trailing slash). Save it.
Repeat this for any later custom domain before expecting Google sign-in there.

### 6. Set Storage CORS for file preview and download

The site uses Firebase SDK `getBlob()` so Storage rules apply to each file
read. The real bucket must allow browser requests from the live site origin.
After the live URL is known, open **Google Cloud console → Activate Cloud
Shell** for the same project. In Cloud Shell, run `nano cors.json`, paste the
JSON below, replace the example origin with the **exact** live origin, then
press `Ctrl+O`, Enter and `Ctrl+X`:

```json
[
  {
    "origin": ["https://YOUR_BACKEND.hosted.app"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Use the actual bucket name shown in Firebase Storage:

```bash
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors.json
gcloud storage buckets describe gs://YOUR_BUCKET_NAME --format="default(cors_config)"
```

The displayed CORS origin should be the live site origin. CORS allows the
browser request; Firestore and Storage rules still decide who may read the
file. Add a second origin only if the site also uses a custom domain.

### 7. Check the live site

1. Open the live URL in a private browser window. Signed out, Home, Web Apps
   and Mistakes Book should open. Teacher-edition files and Manage pages must
   remain inaccessible.
2. Sign in with Google as `t28ltk@lskc.edu.hk`. Confirm **Manage** and
   **Admin → Teachers** appear.
3. In **Manage → Topics**, add one test topic if the live database is empty.
   The emulator's 69 topics are not copied into the real database. Enter the
   department topics from `docs/topics.md` through this page when ready.
4. In **Manage → Upload**, choose the test topic and upload a small, harmless
   **student-edition PDF**. Open its Mistakes Book page while signed in and
   confirm the PDF preview works.
5. Open a fresh private window while signed out. Confirm that this one
   student-edition book is listed, its preview opens, and its download works.
   Check that no teacher-edition book appears.
6. Back in the teacher window, use **Manage → Books** to delete the test book.
   Refresh the signed-out window and confirm it has disappeared. Remove the
   test topic too if it is no longer needed.

If a file lists but its preview fails, check the browser console, exact
bucket CORS origin, and Storage Rules tab before uploading real notes.

## Switch from public to school-only viewing later

`NEXT_PUBLIC_ACCESS_MODE` is the single access-mode setting, but it must agree
in the local rule build and the hosted app build. Change it from `public` to
`school` in both `.env.local` and `apphosting.yaml`. Keep
`NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=lskc.edu.hk` in both places. Then run:

```powershell
npm.cmd run rules:build
npm.cmd run test:rules
npx.cmd firebase deploy --only firestore,storage --project $firebaseProjectId
```

Commit and push the `apphosting.yaml` change so App Hosting builds a new version.
Wait for a successful rollout. Check in a private window that signed-out
visitors cannot read content, and with a verified school account that they
can. Teacher editing must still require an account on the teacher list.
Changing only the page setting or only the rules would leave them out of sync.

## Project files

| File | Purpose |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Working agreement, security model and design system |
| [PLAN.md](PLAN.md) | Phased plan and decision log |
| [docs/topics.md](docs/topics.md) | Department's 69 source topics |
| [.env.example](.env.example) | Local environment settings |
| [apphosting.yaml](apphosting.yaml) | Production access settings |
| [firebase.json](firebase.json) | Emulator and rules/index deployment paths |

Firebase reference guides: [App Hosting setup](https://firebase.google.com/docs/app-hosting/get-started),
[App Hosting configuration](https://firebase.google.com/docs/app-hosting/configure),
[Cloud Billing budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets),
and [Cloud Storage CORS](https://cloud.google.com/storage/docs/configuring-cors).
