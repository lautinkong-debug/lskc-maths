import type { Metadata } from "next";
import { RequireRole } from "@/components/AuthGate";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { copy } from "@/lib/copy";

export const metadata:Metadata={title:copy.challenges.newTitle};
export default function Page(){return <RequireRole role="teacher"><CreateChallenge /></RequireRole>;}
