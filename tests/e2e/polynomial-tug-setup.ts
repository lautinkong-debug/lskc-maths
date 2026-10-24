import { initializeApp, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

/** Add only the named local teacher fixture; never reset shared emulator data. */
export default async function setup() {
  const url = new URL(
    process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3027",
  );
  if (!["localhost", "127.0.0.1"].includes(url.hostname))
    throw new Error("Polynomial Tug tests require a local preview.");
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  const app = initializeApp({ projectId: "demo-lskc-maths" }, "tug-e2e-setup");
  try {
    const auth = getAuth(app),
      email = "teacher2@lskc.edu.hk";
    try {
      await auth.getUserByEmail(email);
    } catch (error) {
      if ((error as { code: string }).code !== "auth/user-not-found")
        throw error;
      await auth.createUser({
        email,
        emailVerified: true,
        password: "LocalTest123!",
        displayName: "Second Teacher",
      });
    }
    const ref = getFirestore(app).doc(`teachers/${email}`);
    if (!(await ref.get()).exists)
      await ref.create({
        name: "Second Teacher",
        isAdmin: false,
        addedBy: "local-tug-test",
        addedAt: Timestamp.now(),
      });
  } finally {
    await deleteApp(app);
  }
}
