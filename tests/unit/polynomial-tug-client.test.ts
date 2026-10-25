import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const ports = vi.hoisted(() => ({
  auth: {
    authStateReady: vi.fn(),
    currentUser: null as { getIdToken: () => Promise<string> } | null,
  },
  signInAnonymously: vi.fn(),
}));
vi.mock("@/lib/firebase", () => ({ auth: ports.auth }));
vi.mock("firebase/auth", () => ({
  signInAnonymously: ports.signInAnonymously,
}));
import { callTug } from "../../src/lib/polynomial-tug/client";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => {
  vi.useFakeTimers();
  ports.auth.authStateReady.mockResolvedValue(undefined);
  ports.auth.currentUser = { getIdToken: async () => "demo-token" };
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () => new Response(JSON.stringify({ state: { code: "ABCDEF" } })),
    ),
  );
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Polynomial Tug request recovery", () => {
  it("times out pending auth and never sends a deferred mutation after auth resumes", async () => {
    const ready = deferred<void>();
    ports.auth.authStateReady.mockReturnValueOnce(ready.promise);
    let failure: unknown;
    const request = callTug({ action: "answer", code: "ABCDEF" }).catch(
      (error) => {
        failure = error;
      },
    );
    await vi.advanceTimersByTimeAsync(15001);
    expect(failure).toMatchObject({ name: "TimeoutError" });
    ready.resolve();
    await vi.advanceTimersByTimeAsync(0);
    await request;
    expect(fetch).not.toHaveBeenCalled();
  });
  it("times out token refresh and prevents a later refresh from sending the mutation", async () => {
    const token = deferred<string>();
    ports.auth.currentUser = { getIdToken: () => token.promise };
    let failure: unknown;
    const request = callTug({ action: "next", code: "ABCDEF" }).catch(
      (error) => {
        failure = error;
      },
    );
    await vi.advanceTimersByTimeAsync(15001);
    expect(failure).toMatchObject({ name: "TimeoutError" });
    token.resolve("late-token");
    await vi.advanceTimersByTimeAsync(0);
    await request;
    expect(fetch).not.toHaveBeenCalled();
  });
  it("times out a stalled response body and aborts its transport", async () => {
    const body = deferred<unknown>();
    const transport = vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => body.promise,
      headers: new Headers(),
    } as Response);
    let failure: unknown;
    const request = callTug(undefined, "ABCDEF").catch((error) => {
      failure = error;
    });
    await vi.advanceTimersByTimeAsync(15001);
    expect(failure).toMatchObject({ name: "TimeoutError" });
    expect(transport.mock.calls[0][1]?.signal?.aborted).toBe(true);
    body.resolve({ state: { code: "ABCDEF" } });
    await request;
  });
  it("preserves server Retry-After so quota failures keep their longer backoff", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Quota reached" }), {
        status: 503,
        headers: { "Retry-After": "60" },
      }),
    );
    await expect(callTug(undefined, "ABCDEF")).rejects.toMatchObject({
      message: "Quota reached",
      retryAfter: 60,
    });
  });
});
