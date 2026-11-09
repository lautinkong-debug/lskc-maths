import type { Metadata } from "next";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.challenges.newTitle };
export default function Page() {
  return <CreateChallenge />;
}
