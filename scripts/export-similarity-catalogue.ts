import { writeFileSync, mkdirSync } from "node:fs";
import { questions } from "../src/apps/similarity/data";
mkdirSync("tmp/similarity-source", { recursive: true });
writeFileSync(
  "tmp/similarity-source/catalogue.json",
  JSON.stringify(questions, null, 2),
);
console.log(`Exported ${questions.length} question records.`);
