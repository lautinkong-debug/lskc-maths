import type { FamilyId, Station } from "../types";
import { s1 } from "./s1";
import { s2 } from "./s2";
import { s3 } from "./s3";
import { s4 } from "./s4";
import { s5 } from "./s5";
import { s6 } from "./s6";
import { s7 } from "./s7";

/** The stations in teaching order. */
export const stations: Station[] = [s1, s2, s3, s4, s5, s6, s7];

export const families: { id: FamilyId; title: string; idea: string }[] = [
  { id: "fold", title: "Chords", idea: "Fold the circle in half" },
  { id: "double", title: "Angles", idea: "The centre angle is double" },
  {
    id: "spin",
    title: "Arcs, chords and angles",
    idea: "Spin one sector onto another",
  },
];
