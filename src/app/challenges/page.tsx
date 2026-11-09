import type { Metadata } from "next";
import { ChallengeList } from "@/components/challenges/ChallengeList";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.challenges.myTitle };
export default function Page() {
  return <ChallengeList />;
}
