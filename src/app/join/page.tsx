import type { Metadata } from "next";
import { JoinChallenge } from "@/components/challenges/JoinChallenge";
import { copy } from "@/lib/copy";

export const metadata:Metadata={title:copy.challenges.joinTitle};
export default function Page(){return <JoinChallenge/>;}
