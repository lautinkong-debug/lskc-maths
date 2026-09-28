import type { Metadata } from "next";
import { RequireRole } from "@/components/AuthGate";
import { ChallengeRoom } from "@/components/challenges/ChallengeRoom";
import { copy } from "@/lib/copy";

export const metadata:Metadata={title:copy.challenges.myTitle};
export default async function Page({params}:{params:Promise<{roomId:string}>}){const {roomId}=await params;return <RequireRole role="teacher"><ChallengeRoom roomId={roomId}/></RequireRole>;}
