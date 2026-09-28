import type { Metadata } from "next";
import { ClassBoards } from "@/components/challenges/ClassBoards";
import { copy } from "@/lib/copy";

export const metadata:Metadata={title:copy.challenges.boardsTitle};
export default function Page(){return <ClassBoards/>;}
