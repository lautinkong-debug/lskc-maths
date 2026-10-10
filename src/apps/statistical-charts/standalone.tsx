import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import StatisticalChartsLab from "./index";
import { copy } from "@/lib/copy";
createRoot(document.getElementById("root")!).render(
  <>
    <header>
      <p>
        {copy.school.department} · {copy.school.short}
      </p>
      <h1>{copy.statisticalCharts.title}</h1>
      <p>{copy.statisticalCharts.topic}</p>
    </header>
    <StatisticalChartsLab />
  </>,
);
