import { writeFileSync } from "node:fs";
import { questions } from "../src/apps/congruence/data";

const output = process.argv[2];
if (!output) throw new Error("Provide the output JSON path.");
writeFileSync(
  output,
  JSON.stringify(
    questions.map(({ id, page, crop }) => ({ id, page, crop })),
    null,
    2,
  ),
);
console.log(`Exported ${questions.length} question crops.`);
