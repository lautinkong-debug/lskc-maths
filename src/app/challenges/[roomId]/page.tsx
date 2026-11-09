import type { Metadata } from "next";
import { ChallengeRoom } from "@/components/challenges/ChallengeRoom";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.challenges.myTitle };
export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <ChallengeRoom roomId={roomId} />;
}
