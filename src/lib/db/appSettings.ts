import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import type { AppEntry } from "@/apps/registry";
import { db } from "@/lib/firebase";

export interface AppSettings {
  slug: string;
  title: string;
  summary: string;
  featured: boolean;
  visible: boolean;
  order: number;
  updatedBy: string;
  updatedAt: Date | null;
}

export type AppSettingsInput = Pick<
  AppSettings,
  "title" | "summary" | "featured" | "visible" | "order"
>;

const converter: FirestoreDataConverter<AppSettings> = {
  toFirestore(settings) {
    return {
      title: settings.title,
      summary: settings.summary,
      featured: settings.featured,
      visible: settings.visible,
      order: settings.order,
      updatedBy: settings.updatedBy,
      updatedAt: settings.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data();
    return {
      slug: snapshot.id,
      title: data.title as string,
      summary: data.summary as string,
      featured: data.featured as boolean,
      visible: data.visible as boolean,
      order: data.order as number,
      updatedBy: data.updatedBy as string,
      updatedAt: data.updatedAt?.toDate() ?? null,
    };
  },
};

const settingsCollection = collection(db, "appSettings").withConverter(
  converter,
);
const settingsRef = (slug: string) =>
  doc(db, "appSettings", slug).withConverter(converter);

export function watchAppSettings(
  onChange: (settings: AppSettings[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsCollection,
    (snapshot) => onChange(snapshot.docs.map((item) => item.data())),
    onError,
  );
}

export function watchAppSetting(
  slug: string,
  onChange: (settings: AppSettings | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(slug),
    (snapshot) => onChange(snapshot.data() ?? null),
    onError,
  );
}

export function defaultAppSettings(app: AppEntry, order: number): AppSettings {
  return {
    slug: app.slug,
    title: "",
    summary: "",
    featured: false,
    visible: true,
    order,
    updatedBy: "",
    updatedAt: null,
  };
}

export function effectiveApp(
  app: AppEntry,
  setting: AppSettings | null,
  defaultOrder: number,
) {
  const values = setting ?? defaultAppSettings(app, defaultOrder);
  return {
    ...app,
    title: values.title.trim() || app.title,
    summary: values.summary.trim() || app.summary,
    featured: values.featured,
    visible: values.visible,
    order: values.order,
    updatedBy: values.updatedBy,
    updatedAt: values.updatedAt,
  };
}

function validate(input: AppSettingsInput): AppSettingsInput {
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (
    title.length > 100 ||
    summary.length > 400 ||
    typeof input.featured !== "boolean" ||
    typeof input.visible !== "boolean" ||
    !Number.isInteger(input.order) ||
    input.order < 0 ||
    input.order > 10000
  ) {
    throw new Error("Invalid app settings.");
  }
  return { ...input, title, summary };
}

export async function saveAppSettings(
  slug: string,
  input: AppSettingsInput,
  email: string,
): Promise<void> {
  const clean = validate(input);
  const batch = writeBatch(db);
  batch.set(settingsRef(slug), {
    slug,
    ...clean,
    updatedBy: email.toLowerCase(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function saveAppOrder(
  settings: { slug: string; input: AppSettingsInput }[],
  email: string,
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of settings) {
    batch.set(settingsRef(item.slug), {
      slug: item.slug,
      ...validate(item.input),
      updatedBy: email.toLowerCase(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}
