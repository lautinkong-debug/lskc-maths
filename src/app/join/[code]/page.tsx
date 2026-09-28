import type { Metadata } from "next";
import { JoinChallenge } from "@/components/challenges/JoinChallenge";
import { copy } from "@/lib/copy";

export const metadata:Metadata={title:copy.challenges.joinTitle};
export default async function Page({params}:{params:Promise<{code:string}>}){const {code}=await params;return <JoinChallenge initialCode={code}/>;}
