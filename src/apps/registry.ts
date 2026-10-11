import type { ComponentType } from "react";
import type { Level, Strand } from "@/lib/constants";
import { copy } from "@/lib/copy";
import QuadraticThumbnail from "./quadratic-explorer/Thumbnail";
import UnitCircleThumbnail from "./unit-circle/Thumbnail";
import InequalityThumbnail from "./inequality-number-line/Thumbnail";
import DirectedNumbersThumbnail from "./directed-numbers/Thumbnail";
import StatisticalChartsThumbnail from "./statistical-charts/Thumbnail";

export interface AppEntry {
  slug: string;
  title: string;
  topic: string;
  /** Chapter codes from the shared Mistakes Book textbook catalogue. */
  topicCodes: readonly string[];
  levels: readonly Level[];
  strand: Strand;
  summary: string;
  thumbnail: ComponentType<{ className?: string }>;
  load: () => Promise<{ default: ComponentType }>;
}

/** The index and detail route both use this list. New apps register here. */
export const appRegistry: readonly AppEntry[] = [
  {
    slug: "statistical-charts",
    topicCodes: ["2A06"],
    title: copy.statisticalCharts.title,
    topic: copy.statisticalCharts.topic,
    levels: ["F2"],
    strand: "data-handling",
    summary: copy.statisticalCharts.summary,
    thumbnail: StatisticalChartsThumbnail,
    load: () => import("./statistical-charts"),
  },
  {
    slug: "directed-numbers",
    topicCodes: ["1A02"],
    title: copy.apps.directedNumbers.title,
    topic: copy.apps.directedNumbers.topic,
    levels: ["F1"],
    strand: "number-algebra",
    summary: copy.apps.directedNumbers.summary,
    thumbnail: DirectedNumbersThumbnail,
    load: () => import("./directed-numbers"),
  },
  {
    slug: "quadratic-explorer",
    topicCodes: ["Ch4"],
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
    topicCodes: ["Ch6"],
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
    topicCodes: ["3A03", "Ch13"],
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
