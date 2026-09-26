import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { copy } from "@/lib/copy";
import { db } from "@/lib/firebase";

export interface Announcement {
  text: string;
  link: string;
  active: boolean;
}

export interface HomeContent {
  heroTitle: string;
  intro: string;
  announcement: Announcement;
  updatedBy: string;
  updatedAt: Date | null;
}

export type HomeContentChanges = Partial<
  Pick<HomeContent, "heroTitle" | "intro" | "announcement">
>;

export const defaultHomeContent: HomeContent = {
  heroTitle: copy.home.heroTitle,
  intro: copy.home.heroIntro,
  announcement: { text: "", link: "", active: false },
  updatedBy: "",
  updatedAt: null,
};

const converter: FirestoreDataConverter<HomeContent> = {
  toFirestore(content) {
    return {
      heroTitle: content.heroTitle,
      intro: content.intro,
      announcement: content.announcement,
      updatedBy: content.updatedBy,
      updatedAt: content.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data();
    return {
      heroTitle: data.heroTitle as string,
      intro: data.intro as string,
      announcement: data.announcement as Announcement,
      updatedBy: data.updatedBy as string,
      updatedAt: data.updatedAt?.toDate() ?? null,
    };
  },
};

const homeRef = doc(db, "siteContent", "home").withConverter(converter);

export function watchHomeContent(
  onChange: (content: HomeContent) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    homeRef,
    (snapshot) => onChange(snapshot.data() ?? defaultHomeContent),
    onError,
  );
}

export function validAnnouncementLink(link: string): boolean {
  return (
    link === "" ||
    (link.startsWith("/") && !link.startsWith("//")) ||
    /^https:\/\/[^\s]+$/.test(link)
  );
}

function validate(changes: HomeContentChanges): HomeContentChanges {
  const heroTitle = changes.heroTitle?.trim();
  const intro = changes.intro?.trim();
  const announcement = changes.announcement && {
    text: changes.announcement.text.trim(),
    link: changes.announcement.link.trim(),
    active: changes.announcement.active,
  };
  if (
    (heroTitle !== undefined && (!heroTitle || heroTitle.length > 100)) ||
    (intro !== undefined && (!intro || intro.length > 500)) ||
    (announcement !== undefined &&
      (announcement.text.length > 300 ||
        announcement.link.length > 300 ||
        !validAnnouncementLink(announcement.link) ||
        (announcement.active && !announcement.text)))
  ) {
    throw new Error("Invalid home content.");
  }
  return {
    ...(heroTitle === undefined ? {} : { heroTitle }),
    ...(intro === undefined ? {} : { intro }),
    ...(announcement === undefined ? {} : { announcement }),
  };
}

export async function saveHomeContent(
  changes: HomeContentChanges,
  email: string,
): Promise<void> {
  const clean = validate(changes);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(homeRef);
    const current = snapshot.data() ?? defaultHomeContent;
    transaction.set(homeRef, {
      ...current,
      ...clean,
      updatedBy: email.toLowerCase(),
      updatedAt: serverTimestamp(),
    });
  });
}
