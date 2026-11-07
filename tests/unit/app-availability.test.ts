import { describe, expect, it } from "vitest";
import { appAvailability } from "@/lib/appAvailability";

const student = {
  schoolMode: false,
  isTeacher: false,
  authLoading: false,
  serverHidden: false,
  live: undefined,
  liveFailed: false,
};

describe("who can open an app", () => {
  describe("in public mode", () => {
    it("opens straight away from the listing in the page", () => {
      expect(appAvailability(student)).toBe("open");
    });

    it("never waits for a live listing that a student does not watch", () => {
      expect(appAvailability({ ...student, liveFailed: true })).toBe("open");
    });

    it("tells a student when the page says the app is hidden", () => {
      expect(appAvailability({ ...student, serverHidden: true })).toBe(
        "unavailable",
      );
    });

    it("waits to learn who it is before turning anyone away", () => {
      expect(
        appAvailability({ ...student, serverHidden: true, authLoading: true }),
      ).toBe("waiting");
    });

    it("keeps a hidden app open for a teacher, marked as hidden", () => {
      expect(
        appAvailability({ ...student, serverHidden: true, isTeacher: true }),
      ).toBe("teacherOnly");
    });

    it("lets a teacher's live listing replace the cached page", () => {
      const teacher = { ...student, isTeacher: true };
      expect(
        appAvailability({
          ...teacher,
          serverHidden: true,
          live: { visible: true },
        }),
      ).toBe("open");
      expect(appAvailability({ ...teacher, live: { visible: false } })).toBe(
        "teacherOnly",
      );
    });

    it("treats an app with no listing as visible", () => {
      expect(
        appAvailability({ ...student, serverHidden: true, live: null }),
      ).toBe("open");
    });
  });

  describe("in school mode", () => {
    const school = { ...student, schoolMode: true };

    it("shows nothing until the live listing arrives", () => {
      expect(appAvailability(school)).toBe("waiting");
      expect(appAvailability({ ...school, isTeacher: true })).toBe("waiting");
    });

    it("stays closed if the live listing cannot be read", () => {
      expect(appAvailability({ ...school, liveFailed: true })).toBe("failed");
    });

    it("follows the live listing once it arrives", () => {
      expect(appAvailability({ ...school, live: { visible: true } })).toBe(
        "open",
      );
      expect(appAvailability({ ...school, live: null })).toBe("open");
      expect(appAvailability({ ...school, live: { visible: false } })).toBe(
        "unavailable",
      );
    });
  });
});
