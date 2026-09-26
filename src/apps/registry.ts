import type { ComponentType } from "react";
import type { Level, Strand } from "@/lib/constants";
import { copy } from "@/lib/copy";
import QuadraticThumbnail from "./quadratic-explorer/Thumbnail";
import UnitCircleThumbnail from "./unit-circle/Thumbnail";
import InequalityThumbnail from "./inequality-number-line/Thumbnail";

export interface AppEntry {
  slug: string;
  title: string;
  topic: string;
  levels: readonly Level[];
  strand: Strand;
  summary: string;
  thumbnail: ComponentType<{ className?: string }>;
  load: () => Promise<{ default: ComponentType }>;
}

/** The index and detail route both use this list. New apps register here. */
export const appRegistry: readonly AppEntry[] = [
  {
    slug: "quadratic-explorer",
    title: copy.apps.quadratic.title,
    topic: copy.apps.quadratic.topic,
    levels: ["F4", "F5", "F6"],
    strand: "number-algebra",
    summary: copy.apps.quadratic.summary,
    thumbnail: QuadraticThumbnail,
    load: () => import("./quadratic-explorer"),
  },
  {
    slug: "unit-circle",
    title: copy.apps.unitCircle.title,
    topic: copy.apps.unitCircle.topic,
    levels: ["F4", "F5", "F6"],
    strand: "measures-shape-space",
    summary: copy.apps.unitCircle.summary,
    thumbnail: UnitCircleThumbnail,
    load: () => import("./unit-circle"),
  },
  {
    slug: "inequality-number-line",
    title: copy.apps.inequality.title,
    topic: copy.apps.inequality.topic,
    levels: ["F3", "F4", "F5", "F6"],
    strand: "number-algebra",
    summary: copy.apps.inequality.summary,
    thumbnail: InequalityThumbnail,
    load: () => import("./inequality-number-line"),
  },
];

export function getApp(slug: string): AppEntry | undefined {
  return appRegistry.find((app) => app.slug === slug);
}
