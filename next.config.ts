import type { NextConfig } from "next";

// App Hosting supplies the linked web app's public config during its build.
// Keep the explicit NEXT_PUBLIC_FIREBASE_* values in .env.local for emulator use.
function hostingFirebaseEnv(): NonNullable<NextConfig["env"]> | undefined {
  const raw = process.env.FIREBASE_WEBAPP_CONFIG;
  if (!raw || process.env.NEXT_PUBLIC_USE_EMULATORS === "true") return;

  const config = JSON.parse(raw) as Record<string, unknown>;
  const fields = {
    NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
  };
  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== "string" || !value) {
      throw new Error(`App Hosting web config is missing ${name}.`);
    }
  }
  return fields as Record<keyof typeof fields, string>;
}

const nextConfig: NextConfig = { env: hostingFirebaseEnv() };

export default nextConfig;
