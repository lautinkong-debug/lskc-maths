import { signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { copy } from "@/lib/copy";
import type { RoomView } from "./types";

export async function callTug(
  body?: Record<string, unknown>,
  code?: string,
): Promise<RoomView> {
  const controller = new AbortController();
  const timeoutError = Object.assign(
    new Error(copy.polynomialTug.requestTimeout),
    { name: "TimeoutError" },
  );
  const checkActive = () => {
    if (controller.signal.aborted) throw timeoutError;
  };
  const request = async () => {
    await auth.authStateReady();
    checkActive();
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
    checkActive();
    const token = await user.getIdToken();
    // Firebase auth cannot be aborted. A late completion must not send a POST
    // after the UI has already reported a timeout and allowed another action.
    checkActive();
    const response = await fetch(
      `/api/polynomial-tug${body ? "" : `?code=${encodeURIComponent(code!)}`}`,
      {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
    const result = await response.json();
    if (!response.ok)
      throw Object.assign(
        new Error(result.message || copy.polynomialTug.errors.connection),
        { retryAfter: Number(response.headers.get("Retry-After")) || 0 },
      );
    return result.state as RoomView;
  };
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(timeoutError);
      controller.abort();
    }, 15000);
  });
  try {
    // Includes auth, token refresh and reading the response body. Timed-out
    // mutations are never replayed here: ordinary polling reconciles the state.
    return await Promise.race([request(), deadline]);
  } finally {
    clearTimeout(timer!);
  }
}
