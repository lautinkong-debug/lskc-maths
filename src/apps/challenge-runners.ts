"use client";
import { lazy } from "react";

export const challengeRunners={"directed-numbers":lazy(()=>import("./directed-numbers/challenge/Runner"))} as const;
