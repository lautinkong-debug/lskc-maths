import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { renderRules } from "../../scripts/build-rules";

const ADMIN = "t28ltk@lskc.edu.hk";
const TEACHER = "teacher2@lskc.edu.hk";
const VIEWER = "viewer@lskc.edu.hk";
const OUTSIDER = "outsider@example.com";

type Persona =
  "visitor" | "viewer" | "teacher" | "admin" | "outsider" | "unverified";

type UploadTask = ReturnType<
  ReturnType<ReturnType<RulesTestContext["storage"]>["ref"]>["put"]
>;
function taskPromise(task: UploadTask): Promise<unknown> {
  return new Promise((resolve, reject) => {
    task.then(resolve, reject);
  });
}

const identities: Record<
  Exclude<Persona, "visitor">,
  { email: string; verified: boolean }
> = {
  viewer: { email: VIEWER, verified: true },
  teacher: { email: TEACHER, verified: true },
  admin: { email: ADMIN, verified: true },
  outsider: { email: OUTSIDER, verified: true },
  unverified: { email: "unverified@lskc.edu.hk", verified: false },
};

function bookData(
  id: string,
  edition: "student" | "teacher",
  persona: Persona,
) {
  const now = new Date();
  return {
    title: "Practice",
    description: "",
    level: "F1",
    topicId: "topic1",
    topicName: "Algebra",
    edition,
    fileType: "pdf",
    fileName: "practice.pdf",
    fileSize: 100,
    storagePath: `mistake-books/${edition}/${id}/${id}.pdf`,
    uploadedBy: {
      uid: persona,
      email:
        persona === "visitor"
          ? "visitor@example.com"
          : identities[persona].email,
      name: "Test teacher",
    },
    createdAt: now,
    updatedAt: now,
  };
}

function emulatorToken(
  projectId: string,
  persona: Exclude<Persona, "visitor">,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: projectId,
    iss: `https://securetoken.google.com/${projectId}`,
    sub: persona,
    user_id: persona,
    email: identities[persona].email,
    email_verified: identities[persona].verified,
    iat: now,
    exp: now + 3600,
    firebase: { sign_in_provider: "password" },
  };
  return `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.`;
}

async function storageRead(
  projectId: string,
  persona: Persona,
  path: string,
): Promise<boolean> {
  const bucket = projectId;
  const headers: Record<string, string> =
    persona === "visitor"
      ? {}
      : { authorization: `Bearer ${emulatorToken(projectId, persona)}` };
  const response = await fetch(
    `http://127.0.0.1:9199/v0/b/${bucket}/o/${encodeURIComponent(path)}`,
    { headers },
  );
  return response.ok;
}

for (const mode of ["public", "school"] as const) {
  describe(`${mode} access mode`, () => {
    let env: RulesTestEnvironment;
    let contexts: Record<Persona, RulesTestContext>;
    // Storage's cross-service firestore.exists() resolves against the CLI's
    // demo project, so both modes use that project and clear it between runs.
    const projectId = "demo-lskc-maths";

    beforeAll(async () => {
      const rules = renderRules({ mode, domains: ["lskc.edu.hk"] });
      env = await initializeTestEnvironment({
        projectId,
        firestore: { host: "127.0.0.1", port: 8080, rules: rules.firestore },
        storage: { host: "127.0.0.1", port: 9199, rules: rules.storage },
      });
      await env.clearFirestore();
      await env.clearStorage();
      contexts = {
        visitor: env.unauthenticatedContext(),
        viewer: env.authenticatedContext("viewer", {
          email: VIEWER,
          email_verified: true,
        }),
        teacher: env.authenticatedContext("teacher", {
          email: TEACHER,
          email_verified: true,
        }),
        admin: env.authenticatedContext("admin", {
          email: ADMIN,
          email_verified: true,
        }),
        outsider: env.authenticatedContext("outsider", {
          email: OUTSIDER,
          email_verified: true,
        }),
        unverified: env.authenticatedContext("unverified", {
          email: "unverified@lskc.edu.hk",
          email_verified: false,
        }),
      };
      await env.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        for (const [email, isAdmin] of [
          [ADMIN, true],
          [TEACHER, false],
        ] as const) {
          await db
            .doc(`teachers/${email}`)
            .set({ name: email, isAdmin, addedBy: ADMIN, addedAt: new Date() });
        }
        await db.doc("topics/topic1").set({ name: "Algebra", levels: ["F1"] });
        await db.doc("siteContent/home").set({ intro: "Welcome" });
        await db.doc("appSettings/app1").set({ visible: false });
        await db
          .doc("mistakeBooks/student1")
          .set({
            edition: "student",
            title: "Practice",
            storagePath: "mistake-books/student/student1/student1.pdf",
          });
        await db
          .doc("mistakeBooks/teacher1")
          .set({
            edition: "teacher",
            title: "Answers",
            storagePath: "mistake-books/teacher/teacher1/teacher1.pdf",
          });
      });
      // Storage fixture writes use an authenticated teacher and therefore also
      // check the Firestore teacher lookup in the Storage rules.
      const teacherStorage = contexts.teacher.storage();
      await assertSucceeds(
        taskPromise(
          teacherStorage
            .ref("mistake-books/student/student1/student1.pdf")
            .putString("student", "raw", { contentType: "application/pdf" }),
        ),
      );
      await assertSucceeds(
        taskPromise(
          teacherStorage
            .ref("mistake-books/teacher/teacher1/teacher1.pdf")
            .putString("teacher", "raw", { contentType: "application/pdf" }),
        ),
      );
    }, 60000);

    afterAll(async () => {
      await env?.cleanup();
    });

    it("enforces content reads for every account type", async () => {
      for (const persona of Object.keys(contexts) as Persona[]) {
        const allowed =
          mode === "public" || ["viewer", "teacher", "admin"].includes(persona);
        for (const path of [
          "topics/topic1",
          "siteContent/home",
          "appSettings/app1",
          "mistakeBooks/student1",
        ]) {
          const result = contexts[persona].firestore().doc(path).get();
          if (allowed) await assertSucceeds(result);
          else await assertFails(result);
        }
      }
    });

    it("restricts teacher-edition books and files to teachers", async () => {
      for (const persona of Object.keys(contexts) as Persona[]) {
        const allowed = persona === "teacher" || persona === "admin";
        const book = contexts[persona]
          .firestore()
          .doc("mistakeBooks/teacher1")
          .get();
        if (allowed) await assertSucceeds(book);
        else await assertFails(book);
        const file = await storageRead(
          projectId,
          persona,
          "mistake-books/teacher/teacher1/teacher1.pdf",
        );
        expect(file).toBe(allowed);
      }
    });

    it("permits student-file reads only to the configured audience", async () => {
      for (const persona of Object.keys(contexts) as Persona[]) {
        const allowed =
          mode === "public" || ["viewer", "teacher", "admin"].includes(persona);
        const file = await storageRead(
          projectId,
          persona,
          "mistake-books/student/student1/student1.pdf",
        );
        expect(file).toBe(allowed);
      }
    });

    it("requires a student-edition filter on non-teacher book queries", async () => {
      for (const persona of ["visitor", "viewer"] as const) {
        const books = contexts[persona].firestore().collection("mistakeBooks");
        if (mode === "public" || persona === "viewer") {
          const snapshot = await assertSucceeds(
            books.where("edition", "==", "student").get(),
          );
          expect(snapshot.docs.map((doc) => doc.id)).not.toContain("teacher1");
        } else {
          await assertFails(books.where("edition", "==", "student").get());
        }
        await assertFails(books.get());
      }
      await assertSucceeds(
        contexts.teacher.firestore().collection("mistakeBooks").get(),
      );
    });

    it("permits content writes only to teachers and admins", async () => {
      for (const persona of Object.keys(contexts) as Persona[]) {
        const allowed = persona === "teacher" || persona === "admin";
        for (const [path, value] of [
          ["topics/new", { name: "New" }],
          ["siteContent/new", { intro: "New" }],
          ["appSettings/new", { visible: true }],
          [
            `mistakeBooks/new-${persona}`,
            bookData(`new-${persona}`, "student", persona),
          ],
        ] as const) {
          const write = contexts[persona].firestore().doc(path).set(value);
          if (allowed) await assertSucceeds(write);
          else await assertFails(write);
        }
      }
    });

    it("keeps teacher-list reads narrow and writes admin-only", async () => {
      await assertFails(
        contexts.visitor.firestore().doc(`teachers/${ADMIN}`).get(),
      );
      await assertSucceeds(
        contexts.viewer.firestore().doc(`teachers/${VIEWER}`).get(),
      );
      await assertSucceeds(
        contexts.teacher.firestore().doc(`teachers/${TEACHER}`).get(),
      );
      await assertFails(
        contexts.teacher.firestore().doc(`teachers/${ADMIN}`).get(),
      );
      await assertFails(
        contexts.teacher.firestore().collection("teachers").get(),
      );
      await assertSucceeds(
        contexts.admin.firestore().collection("teachers").get(),
      );
      const teacherData = {
        name: "Another",
        isAdmin: false,
        addedBy: ADMIN,
        addedAt: new Date(),
      };
      await assertFails(
        contexts.teacher
          .firestore()
          .doc("teachers/new@lskc.edu.hk")
          .set(teacherData),
      );
      await assertSucceeds(
        contexts.admin
          .firestore()
          .doc("teachers/new@lskc.edu.hk")
          .set(teacherData),
      );
      await assertFails(
        contexts.admin.firestore().doc(`teachers/${ADMIN}`).delete(),
      );
      await assertFails(
        contexts.admin
          .firestore()
          .doc(`teachers/${ADMIN}`)
          .update({ isAdmin: false }),
      );
      await assertFails(
        contexts.admin
          .firestore()
          .doc("teachers/outsider@example.com")
          .set(teacherData),
      );
    });

    it("enforces Storage upload role, edition, type, size and path", async () => {
      const path = "mistake-books/student/student1/student1.pdf";
      for (const persona of [
        "visitor",
        "viewer",
        "outsider",
        "unverified",
      ] as const) {
        await assertFails(
          taskPromise(
            contexts[persona]
              .storage()
              .ref(path)
              .putString("x", "raw", { contentType: "application/pdf" }),
          ),
        );
      }
      await assertSucceeds(
        taskPromise(
          contexts.teacher
            .storage()
            .ref(path)
            .putString("x", "raw", { contentType: "application/pdf" }),
        ),
      );
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/other/student1/student1.pdf")
            .putString("x", "raw", { contentType: "application/pdf" }),
        ),
      );
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/student/student1/student1.exe")
            .putString("x", "raw", { contentType: "application/x-msdownload" }),
        ),
      );
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/student/student1/student1.docx")
            .putString("x", "raw", { contentType: "application/pdf" }),
        ),
      );
      await assertSucceeds(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/student/docx1/docx1.docx")
            .putString("x", "raw", {
              contentType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }),
        ),
      );
      await assertSucceeds(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/teacher/html1/html1.html")
            .putString("<p>x</p>", "raw", { contentType: "text/html" }),
        ),
      );
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/student/student1/student1.pdf")
            .put(new Uint8Array(0), { contentType: "application/pdf" }),
        ),
      );
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("elsewhere/x.pdf")
            .putString("x", "raw", { contentType: "application/pdf" }),
        ),
      );
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/student/student1/student1.pdf")
            .put(new Uint8Array(20 * 1024 * 1024 + 1), {
              contentType: "application/pdf",
            }),
        ),
      );
      await assertFails(contexts.visitor.storage().ref(path).delete());
      await assertSucceeds(contexts.teacher.storage().ref(path).delete());
      await assertFails(
        taskPromise(
          contexts.teacher
            .storage()
            .ref("mistake-books/student/student1/extra.pdf")
            .putString("x", "raw", { contentType: "application/pdf" }),
        ),
      );
    }, 60000);

    it("requires a matching book record before a file can be read", async () => {
      const path = "mistake-books/student/orphan/orphan.pdf";
      await assertSucceeds(
        taskPromise(
          contexts.teacher
            .storage()
            .ref(path)
            .putString("x", "raw", { contentType: "application/pdf" }),
        ),
      );
      expect(await storageRead(projectId, "visitor", path)).toBe(false);
      expect(await storageRead(projectId, "teacher", path)).toBe(false);
      const unrecordedPath = "mistake-books/student/student1/student1.docx";
      await assertSucceeds(
        taskPromise(
          contexts.teacher.storage().ref(unrecordedPath).putString("x", "raw", {
            contentType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
        ),
      );
      expect(await storageRead(projectId, "visitor", unrecordedPath)).toBe(false);
      expect(await storageRead(projectId, "teacher", unrecordedPath)).toBe(false);
      expect(
        await storageRead(
          projectId,
          "visitor",
          "mistake-books/teacher/teacher1/teacher1.pdf",
        ),
      ).toBe(false);
    });

    it("keeps book edition, file kind and Storage path fixed", async () => {
      const ref = contexts.teacher.firestore().doc("mistakeBooks/validated");
      await assertSucceeds(
        ref.set(bookData("validated", "student", "teacher")),
      );
      await assertFails(ref.update({ edition: "teacher" }));
      await assertFails(
        ref.update({ storagePath: "mistake-books/student/other/file.pdf" }),
      );
      await assertFails(ref.update({ fileType: "html" }));
      await assertFails(ref.update({ topicId: "missing" }));
      await assertSucceeds(ref.update({ title: "Updated practice" }));
    });
  });
}
