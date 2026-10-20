import type { TextbookSolution } from "./textbook-types";

const tex = String.raw;

// Read directly from the supplied Full Solutions PDF, pages 6–7 and 9–10.
// The printed order, ratio directions, intermediate lines and reasons are retained.
export const textbookAB: Record<string, TextbookSolution> = {
  "ex8a-12": {
    pages: [6],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [tex`\because \triangle ABC\sim\triangle DEF`],
        highlights: { figures: ["ABC", "DEF"] },
      },
      {
        math: [tex`\therefore \angle E=\angle B`, tex`=50^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["DEF", "ABC"] },
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle ABC\sim\triangle DEF`],
        highlights: { figures: ["ABC", "DEF"] },
      },
      {
        math: [tex`\therefore \angle C=\angle F`, tex`=70^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ACB", "DFE"] },
      },
      { heading: "In △ABC,", highlights: { figures: ["ABC"] } },
      {
        math: [
          tex`\angle A+50^\circ+\angle C=180^\circ`,
          tex`\angle A+50^\circ+70^\circ=180^\circ`,
          tex`\angle A=60^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "ACB"] },
      },
    ],
  },
  "ex8a-13": {
    pages: [6],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [tex`\because \triangle ABC\sim\triangle XYZ`],
        highlights: { figures: ["ABC", "XYZ"] },
      },
      {
        math: [
          tex`\therefore \frac{BC}{YZ}=\frac{AB}{XY}`,
          tex`\frac{BC}{8\text{ cm}}=\frac{12\text{ cm}}{5\text{ cm}}`,
          tex`BC=19.2\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["BC", "YZ", "AB", "XY"] },
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle ABC\sim\triangle XYZ`],
        highlights: { figures: ["ABC", "XYZ"] },
      },
      {
        math: [
          tex`\therefore \frac{AC}{XZ}=\frac{AB}{XY}`,
          tex`\frac{AC}{12\text{ cm}}=\frac{12\text{ cm}}{5\text{ cm}}`,
          tex`AC=28.8\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["AC", "XZ", "AB", "XY"] },
      },
    ],
  },
  "ex8a-14": {
    pages: [6],
    initialVisible: 1,
    steps: [
      {
        math: [tex`\because \triangle ABC\sim\triangle QPR`],
        highlights: { figures: ["ABC", "QPR"] },
      },
      {
        math: [tex`\therefore \angle B=\angle P`, tex`=135^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ABC", "QPR"] },
      },
      { heading: "In △ABC,", highlights: { figures: ["ABC"] } },
      {
        math: [
          tex`x+\angle B+2x=180^\circ`,
          tex`x+135^\circ+2x=180^\circ`,
          tex`3x=45^\circ`,
          tex`x=15^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "ACB"] },
      },
      {
        math: [tex`\because \triangle ABC\sim\triangle QPR`],
        highlights: { figures: ["ABC", "QPR"] },
      },
      {
        math: [
          tex`\therefore \angle R=\angle C`,
          tex`y=2x`,
          tex`=2(15^\circ)`,
          tex`=30^\circ`,
        ],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["PRQ", "ACB"] },
      },
    ],
  },
  "ex8a-15": {
    pages: [6],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [tex`\because \triangle PQR\sim\triangle TSR`],
        highlights: { figures: ["PQR", "TSR"] },
      },
      {
        math: [
          tex`\therefore \frac{QR}{SR}=\frac{PQ}{TS}`,
          tex`\frac{QR}{7.5\text{ cm}}=\frac{8\text{ cm}}{6\text{ cm}}`,
          tex`QR=10\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["QR", "SR", "PQ", "TS"] },
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle PQR\sim\triangle TSR`],
        highlights: { figures: ["PQR", "TSR"] },
      },
      {
        math: [
          tex`\therefore \frac{RT}{RP}=\frac{TS}{PQ}`,
          tex`\frac{RT}{6\text{ cm}}=\frac{6\text{ cm}}{8\text{ cm}}`,
          tex`RT=4.5\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["RT", "RP", "TS", "PQ"] },
      },
    ],
  },
  "ex8a-16": {
    pages: [6],
    initialVisible: 1,
    steps: [
      {
        math: [tex`\because \triangle ABC\sim\triangle DEC`],
        highlights: { figures: ["ABC", "DEC"] },
      },
      {
        math: [
          tex`\therefore \frac{EC}{BC}=\frac{DE}{AB}`,
          tex`\frac{y}{4+y}=\frac{8}{10}`,
          tex`10y=8(4+y)`,
          tex`10y=32+8y`,
          tex`2y=32`,
          tex`y=16`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["EC", "BC", "DE", "AB"] },
      },
    ],
  },
  "ex8a-17": {
    pages: [6],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [tex`\because \triangle ABC\sim\triangle CDB`],
        highlights: { figures: ["ABC", "CDB"] },
      },
      {
        math: [tex`\therefore \angle ABC=\angle CDB`, tex`=85^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ABC", "CDB"] },
      },
      { heading: "(b) In △CBD,", highlights: { figures: ["CBD"] } },
      {
        math: [
          tex`\angle CBD+85^\circ+23^\circ=180^\circ`,
          tex`\angle CBD=72^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["CBD", "CDB", "BCD"] },
      },
      {
        math: [tex`\because \triangle ABC\sim\triangle CDB`],
        highlights: { figures: ["ABC", "CDB"] },
      },
      {
        math: [tex`\therefore \angle ACB=\angle CBD`, tex`=72^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ACB", "CBD"] },
      },
      {
        math: [
          tex`\angle ACD=\angle ACB+23^\circ`,
          tex`=72^\circ+23^\circ`,
          tex`=95^\circ`,
        ],
        highlights: { angles: ["ACD", "ACB", "BCD"] },
      },
    ],
  },
  "ex8a-18": {
    pages: [7],
    initialVisible: 1,
    steps: [
      { heading: "In △BCD,", highlights: { figures: ["BCD"] } },
      {
        math: [tex`y+40^\circ=63^\circ`, tex`y=23^\circ`],
        reason: "ext. ∠ of △",
        highlights: { angles: ["CBD", "BCD", "BDA"] },
      },
      {
        math: [tex`\because \triangle ABC\sim\triangle ADB`],
        highlights: { figures: ["ABC", "ADB"] },
      },
      {
        math: [tex`\therefore \angle ABD=\angle ACB`, tex`=40^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ABD", "ACB"] },
      },
      { heading: "In △ADB,", highlights: { figures: ["ADB"] } },
      {
        math: [
          tex`x+\angle ABD+63^\circ=180^\circ`,
          tex`x+40^\circ+63^\circ=180^\circ`,
          tex`x=77^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["BAD", "ABD", "BDA"] },
      },
      {
        heading: "Alternative Solution",
        highlights: { figures: ["ABC", "ADB"] },
      },
      {
        math: [tex`\because \triangle ABC\sim\triangle ADB`],
        highlights: { figures: ["ABC", "ADB"] },
      },
      {
        math: [tex`\therefore \angle ABD=\angle ACB`, tex`=40^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ABD", "ACB"] },
      },
      { heading: "In △ADB,", highlights: { figures: ["ADB"] } },
      {
        math: [
          tex`\angle BAD+\angle ABD+\angle BDA=180^\circ`,
          tex`x+40^\circ+63^\circ=180^\circ`,
          tex`x=77^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["BAD", "ABD", "BDA"] },
      },
      {
        math: [tex`\because \triangle ABC\sim\triangle ADB`],
        highlights: { figures: ["ABC", "ADB"] },
      },
      {
        math: [tex`\therefore \angle ABC=\angle ADB`, tex`=63^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ABC", "ADB"] },
      },
      {
        math: [
          tex`\angle CBD=\angle ABC-\angle ABD`,
          tex`y=63^\circ-40^\circ`,
          tex`=23^\circ`,
        ],
        highlights: { angles: ["CBD", "ABC", "ABD"] },
      },
    ],
  },
  "ex8a-19": {
    pages: [7],
    initialVisible: 1,
    steps: [
      {
        math: [tex`\because \triangle ABC\sim\triangle KBH`],
        highlights: { figures: ["ABC", "KBH"] },
      },
      {
        math: [
          tex`\therefore \frac{BC}{BH}=\frac{AB}{KB}`,
          tex`\frac{4\text{ cm}+KC}{5\text{ cm}}=\frac{(3+5)\text{ cm}}{4\text{ cm}}`,
          tex`\frac{4\text{ cm}+KC}{5\text{ cm}}=2`,
          tex`4\text{ cm}+KC=10\text{ cm}`,
          tex`KC=6\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["BC", "BH", "AB", "KB", "KC"] },
      },
    ],
  },
  "ex8a-20": {
    pages: [7],
    initialVisible: 1,
    steps: [
      {
        math: [tex`\because \triangle ABC\sim\triangle ADE`],
        highlights: { figures: ["ABC", "ADE"] },
      },
      {
        math: [tex`\therefore \angle ACB=\angle AED`, tex`=49^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ACB", "AED"] },
      },
      { heading: "In △ABC,", highlights: { figures: ["ABC"] } },
      {
        math: [
          tex`61^\circ+x+\angle ACB=180^\circ`,
          tex`61^\circ+x+49^\circ=180^\circ`,
          tex`x=70^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "ACB"] },
      },
      {
        math: [tex`\because \triangle ABC\sim\triangle ADE`],
        highlights: { figures: ["ABC", "ADE"] },
      },
      {
        math: [
          tex`\therefore \frac{AC}{AE}=\frac{AB}{AD}`,
          tex`\frac{y}{y+5}=\frac{6}{6+4}`,
          tex`\frac{y}{y+5}=\frac{3}{5}`,
          tex`5y=3y+15`,
          tex`2y=15`,
          tex`y=7.5`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["AC", "AE", "AB", "AD"] },
      },
    ],
  },
  "ex8a-21": {
    pages: [7],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [tex`\because \triangle ABC\sim\triangle DAC`],
        highlights: { figures: ["ABC", "DAC"] },
      },
      {
        math: [
          tex`\therefore \frac{AB}{DA}=\frac{BC}{AC}`,
          tex`\frac{AB}{2\text{ cm}}=\frac{6\text{ cm}}{4\text{ cm}}`,
          tex`AB=3\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["AB", "DA", "BC", "AC"] },
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle ABC\sim\triangle DAC`],
        highlights: { figures: ["ABC", "DAC"] },
      },
      {
        math: [
          tex`\therefore \frac{DC}{AC}=\frac{AC}{BC}`,
          tex`\frac{DC}{4\text{ cm}}=\frac{4\text{ cm}}{6\text{ cm}}`,
          tex`DC=\frac{8}{3}\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["DC", "AC", "BC"] },
      },
      {
        heading: "(c)",
        math: [tex`\because \triangle ABC\sim\triangle DAC`],
        highlights: { figures: ["ABC", "DAC"] },
      },
      {
        math: [tex`\therefore \angle DAC=\angle ABC`, tex`=36^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["DAC", "ABC"] },
      },
      { heading: "In △ACD,", highlights: { figures: ["ACD"] } },
      {
        math: [
          tex`\angle DAC+\angle ACD+117^\circ=180^\circ`,
          tex`36^\circ+\angle ACD+117^\circ=180^\circ`,
          tex`\angle ACD=27^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["DAC", "ACD", "ADC"] },
      },
      {
        math: [tex`\angle BCA=\angle ACD`, tex`=27^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["BCA", "ACD"] },
      },
      {
        math: [
          tex`\angle BCD=\angle BCA+\angle ACD`,
          tex`=27^\circ+27^\circ`,
          tex`=54^\circ`,
        ],
        highlights: { angles: ["BCD", "BCA", "ACD"] },
      },
    ],
  },
  "ex8a-22": {
    pages: [7],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [tex`\because \triangle ABE\sim\triangle DBC`],
        highlights: { figures: ["ABE", "DBC"] },
      },
      {
        math: [
          tex`\therefore \frac{BE}{BC}=\frac{AE}{DC}`,
          tex`\frac{BE}{12\text{ cm}}=\frac{15\text{ cm}}{20\text{ cm}}`,
          tex`BE=9\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["BE", "BC", "AE", "DC"] },
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle ABE\sim\triangle DBC`],
        highlights: { figures: ["ABE", "DBC"] },
      },
      {
        math: [
          tex`\therefore \frac{AB}{DB}=\frac{AE}{DC}`,
          tex`\frac{AB}{(7+9)\text{ cm}}=\frac{15\text{ cm}}{20\text{ cm}}`,
          tex`AB=\frac{15}{20}\times16\text{ cm}`,
          tex`=12\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["AB", "DB", "AE", "DC"] },
      },
      {
        text: "∴ AB and BC are of equal length.",
        highlights: { sides: ["AB", "BC"] },
      },
    ],
  },
  "ex8b-16": {
    pages: [9],
    initialVisible: 9,
    steps: [
      { heading: "In △ABC,", highlights: { figures: ["ABC"] } },
      {
        math: [
          tex`\angle CAB+54^\circ+70^\circ=180^\circ`,
          tex`\angle CAB=56^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["CAB", "ACB", "ABC"] },
      },
      { heading: "In △CDE,", highlights: { figures: ["CDE"] } },
      {
        math: [
          tex`70^\circ+\angle CED+56^\circ=180^\circ`,
          tex`\angle CED=54^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["CDE", "CED", "ECD"] },
      },
      { heading: "In △ABC and △CDE,", highlights: { figures: ["ABC", "CDE"] } },
      {
        math: [tex`\angle ABC=\angle CDE`],
        reason: "given",
        highlights: { angles: ["ABC", "CDE"] },
      },
      {
        math: [tex`\angle ACB=\angle CED`],
        highlights: { angles: ["ACB", "CED"] },
      },
      {
        math: [tex`\angle CAB=\angle ECD`],
        highlights: { angles: ["CAB", "ECD"] },
      },
      {
        math: [tex`\therefore \triangle ABC\sim\triangle CDE`],
        reason: "AAA",
        highlights: { figures: ["ABC", "CDE"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-17": {
    pages: [9],
    initialVisible: 6,
    steps: [
      { heading: "In △CDB and △BDA,", highlights: { figures: ["CDB", "BDA"] } },
      {
        math: [tex`\because \frac{AB}{BC}=\frac{27}{18}=\frac{3}{2}`],
        highlights: { sides: ["AB", "BC"] },
      },
      {
        math: [tex`\frac{BD}{CD}=\frac{12}{8}=\frac{3}{2}`],
        highlights: { sides: ["BD", "CD"] },
      },
      {
        math: [tex`\frac{AD}{BD}=\frac{18}{12}=\frac{3}{2}`],
        highlights: { sides: ["AD", "BD"] },
      },
      {
        math: [tex`\therefore \frac{AB}{BC}=\frac{BD}{CD}=\frac{AD}{BD}`],
        highlights: { sides: ["AB", "BC", "BD", "CD", "AD"] },
      },
      {
        math: [tex`\therefore \triangle CDB\sim\triangle BDA`],
        reason: "3 sides prop.",
        highlights: { figures: ["CDB", "BDA"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-18": {
    pages: [9],
    initialVisible: 6,
    steps: [
      { heading: "In △ABC and △EDC,", highlights: { figures: ["ABC", "EDC"] } },
      {
        math: [tex`\because \frac{CE}{CA}=\frac{3}{12}=\frac{1}{4}`],
        highlights: { sides: ["CE", "CA"] },
      },
      {
        math: [tex`\frac{CD}{CB}=\frac{4}{16}=\frac{1}{4}`],
        highlights: { sides: ["CD", "CB"] },
      },
      {
        math: [tex`\therefore \frac{CE}{CA}=\frac{CD}{CB}`],
        highlights: { sides: ["CE", "CA", "CD", "CB"] },
      },
      {
        math: [tex`\angle ACB=\angle ECD`],
        reason: "given",
        highlights: { angles: ["ACB", "ECD"] },
      },
      {
        math: [tex`\therefore \triangle ABC\sim\triangle EDC`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABC", "EDC"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-19": {
    pages: [9],
    initialVisible: 6,
    steps: [
      { heading: "In △ABD and △ACE,", highlights: { figures: ["ABD", "ACE"] } },
      {
        math: [
          tex`\because \frac{AC}{AB}=\frac{15+10}{15}=\frac{25}{15}=\frac{5}{3}`,
        ],
        highlights: { sides: ["AC", "AB"] },
      },
      {
        math: [tex`\frac{AE}{AD}=\frac{18+12}{18}=\frac{30}{18}=\frac{5}{3}`],
        highlights: { sides: ["AE", "AD"] },
      },
      {
        math: [tex`\therefore \frac{AC}{AB}=\frac{AE}{AD}`],
        highlights: { sides: ["AC", "AB", "AE", "AD"] },
      },
      {
        math: [tex`\angle BAD=\angle CAE`],
        reason: "common ∠",
        highlights: { angles: ["BAD", "CAE"] },
      },
      {
        math: [tex`\therefore \triangle ABD\sim\triangle ACE`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABD", "ACE"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-20": {
    pages: [9],
    initialVisible: 7,
    steps: [
      { heading: "In △PQS and △PRQ,", highlights: { figures: ["PQS", "PRQ"] } },
      {
        math: [tex`\angle PQS=\angle PRQ`],
        reason: "given",
        highlights: { angles: ["PQS", "PRQ"] },
      },
      {
        math: [tex`\angle QPS=\angle RPQ`],
        reason: "common ∠",
        highlights: { angles: ["QPS", "RPQ"] },
      },
      {
        math: [tex`\because \angle PSQ=180^\circ-\angle PQS-\angle QPS`],
        reason: "∠ sum of △",
        highlights: { angles: ["PSQ", "PQS", "QPS"] },
      },
      {
        math: [tex`\angle PQR=180^\circ-\angle PRQ-\angle RPQ`],
        reason: "∠ sum of △",
        highlights: { angles: ["PQR", "PRQ", "RPQ"] },
      },
      {
        math: [tex`\therefore \angle PSQ=\angle PQR`],
        highlights: { angles: ["PSQ", "PQR"] },
      },
      {
        math: [tex`\therefore \triangle PQS\sim\triangle PRQ`],
        reason: "AAA",
        highlights: { figures: ["PQS", "PRQ"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-21": {
    pages: [9],
    initialVisible: 7,
    steps: [
      { heading: "In △ABD and △ACE,", highlights: { figures: ["ABD", "ACE"] } },
      {
        math: [tex`\angle BAD=\angle CAE`],
        reason: "common ∠",
        highlights: { angles: ["BAD", "CAE"] },
      },
      {
        math: [tex`\angle ADB=\angle AEC`],
        reason: "given",
        highlights: { angles: ["ADB", "AEC"] },
      },
      {
        math: [tex`\because \angle ABD=180^\circ-\angle BAD-\angle ADB`],
        reason: "∠ sum of △",
        highlights: { angles: ["ABD", "BAD", "ADB"] },
      },
      {
        math: [tex`\angle ACE=180^\circ-\angle CAE-\angle AEC`],
        reason: "∠ sum of △",
        highlights: { angles: ["ACE", "CAE", "AEC"] },
      },
      {
        math: [tex`\therefore \angle ABD=\angle ACE`],
        highlights: { angles: ["ABD", "ACE"] },
      },
      {
        math: [tex`\therefore \triangle ABD\sim\triangle ACE`],
        reason: "AAA",
        highlights: { figures: ["ABD", "ACE"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-22": {
    pages: [9],
    initialVisible: 6,
    steps: [
      { heading: "In △ABC and △BCD,", highlights: { figures: ["ABC", "BCD"] } },
      {
        math: [
          tex`\because \frac{AB}{BC}=\frac{4\text{ cm}}{6\text{ cm}}=\frac{2}{3}`,
        ],
        highlights: { sides: ["AB", "BC"] },
      },
      {
        math: [tex`\frac{BC}{CD}=\frac{6\text{ cm}}{9\text{ cm}}=\frac{2}{3}`],
        highlights: { sides: ["BC", "CD"] },
      },
      {
        math: [tex`\therefore \frac{AB}{BC}=\frac{BC}{CD}`],
        highlights: { sides: ["AB", "BC", "CD"] },
      },
      {
        math: [tex`\angle ABC=\angle BCD`],
        reason: "given",
        highlights: { angles: ["ABC", "BCD"] },
      },
      {
        math: [tex`\therefore \triangle ABC\sim\triangle BCD`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABC", "BCD"] },
        conclusion: true,
      },
    ],
  },
  "ex8b-23": {
    pages: [10],
    initialVisible: 6,
    steps: [
      {
        heading: "(a) In △ABE and △ADC,",
        highlights: { figures: ["ABE", "ADC"] },
      },
      {
        math: [
          tex`\because \frac{AD}{AB}=\frac{(3+5)\text{ cm}}{4\text{ cm}}=\frac{8}{4}=2`,
        ],
        highlights: { sides: ["AD", "AB"] },
      },
      {
        math: [
          tex`\frac{AC}{AE}=\frac{(4+2)\text{ cm}}{3\text{ cm}}=\frac{6}{3}=2`,
        ],
        highlights: { sides: ["AC", "AE"] },
      },
      {
        math: [tex`\therefore \frac{AD}{AB}=\frac{AC}{AE}`],
        highlights: { sides: ["AD", "AB", "AC", "AE"] },
      },
      {
        math: [tex`\angle BAE=\angle DAC`],
        reason: "common ∠",
        highlights: { angles: ["BAE", "DAC"] },
      },
      {
        math: [tex`\therefore \triangle ABE\sim\triangle ADC`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABE", "ADC"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle ABE\sim\triangle ADC`],
        reason: "proved in (a)",
        highlights: { figures: ["ABE", "ADC"] },
      },
      {
        math: [
          tex`\therefore \frac{CD}{EB}=\frac{AC}{AE}`,
          tex`\frac{CD}{1.8\text{ cm}}=\frac{6\text{ cm}}{3\text{ cm}}`,
          tex`CD=3.6\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["CD", "EB", "AC", "AE"] },
      },
    ],
  },
  "ex8b-24": {
    pages: [10],
    initialVisible: 7,
    steps: [
      {
        heading: "(a) In △RQS and △RTP,",
        highlights: { figures: ["RQS", "RTP"] },
      },
      {
        math: [tex`\angle RQS=\angle RTP`],
        reason: "given",
        highlights: { angles: ["RQS", "RTP"] },
      },
      {
        math: [tex`\angle QRS=\angle TRP`],
        reason: "common ∠",
        highlights: { angles: ["QRS", "TRP"] },
      },
      {
        math: [tex`\because \angle RSQ=180^\circ-\angle RQS-\angle QRS`],
        reason: "∠ sum of △",
        highlights: { angles: ["RSQ", "RQS", "QRS"] },
      },
      {
        math: [tex`\angle RPT=180^\circ-\angle RTP-\angle TRP`],
        reason: "∠ sum of △",
        highlights: { angles: ["RPT", "RTP", "TRP"] },
      },
      {
        math: [tex`\therefore \angle RSQ=\angle RPT`],
        highlights: { angles: ["RSQ", "RPT"] },
      },
      {
        math: [tex`\therefore \triangle RQS\sim\triangle RTP`],
        reason: "AAA",
        highlights: { figures: ["RQS", "RTP"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle RQS\sim\triangle RTP`],
        reason: "proved in (a)",
        highlights: { figures: ["RQS", "RTP"] },
      },
      {
        math: [
          tex`\therefore \frac{QR}{TR}=\frac{RS}{RP}`,
          tex`\frac{10\text{ cm}}{ST+8\text{ cm}}=\frac{8\text{ cm}}{(10+10)\text{ cm}}`,
          tex`\frac{10\text{ cm}}{ST+8\text{ cm}}=\frac{2}{5}`,
          tex`50\text{ cm}=2ST+16\text{ cm}`,
          tex`34\text{ cm}=2ST`,
          tex`ST=17\text{ cm}`,
        ],
        reason: "corr. sides, ~△s",
        highlights: { sides: ["QR", "TR", "RS", "RP", "ST"] },
      },
    ],
  },
  "ex8b-25": {
    pages: [10],
    initialVisible: 6,
    steps: [
      {
        heading: "(a) In △PQR and △TSR,",
        highlights: { figures: ["PQR", "TSR"] },
      },
      {
        math: [
          tex`\because \frac{TS}{PQ}=\frac{15\text{ cm}}{20\text{ cm}}=\frac{3}{4}`,
        ],
        highlights: { sides: ["TS", "PQ"] },
      },
      {
        math: [tex`\frac{SR}{QR}=\frac{9\text{ cm}}{12\text{ cm}}=\frac{3}{4}`],
        highlights: { sides: ["SR", "QR"] },
      },
      {
        math: [
          tex`\frac{TR}{PR}=\frac{21\text{ cm}}{(7+21)\text{ cm}}=\frac{21}{28}=\frac{3}{4}`,
        ],
        highlights: { sides: ["TR", "PR"] },
      },
      {
        math: [tex`\therefore \frac{TS}{PQ}=\frac{SR}{QR}=\frac{TR}{PR}`],
        highlights: { sides: ["TS", "PQ", "SR", "QR", "TR", "PR"] },
      },
      {
        math: [tex`\therefore \triangle PQR\sim\triangle TSR`],
        reason: "3 sides prop.",
        highlights: { figures: ["PQR", "TSR"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [tex`\because \triangle PQR\sim\triangle TSR`],
        reason: "proved in (a)",
        highlights: { figures: ["PQR", "TSR"] },
      },
      {
        math: [tex`\therefore \angle PRQ=\angle TRS`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["PRQ", "TRS"] },
      },
      {
        text: "∴ PR bisects ∠QRS.",
        highlights: { sides: ["PR"], angles: ["QRS", "PRQ", "TRS"] },
      },
    ],
  },
  "ex8b-26": {
    pages: [10],
    initialVisible: 6,
    steps: [
      {
        heading: "(a) In △ADC and △ACB,",
        highlights: { figures: ["ADC", "ACB"] },
      },
      {
        math: [
          tex`\because \frac{AB}{AC}=\frac{(6+2)\text{ cm}}{4\text{ cm}}=\frac{8}{4}=2`,
        ],
        highlights: { sides: ["AB", "AC"] },
      },
      {
        math: [tex`\frac{AC}{AD}=\frac{4\text{ cm}}{2\text{ cm}}=2`],
        highlights: { sides: ["AC", "AD"] },
      },
      {
        math: [tex`\therefore \frac{AB}{AC}=\frac{AC}{AD}`],
        highlights: { sides: ["AB", "AC", "AD"] },
      },
      {
        math: [tex`\angle CAD=\angle BAC`],
        reason: "common ∠",
        highlights: { angles: ["CAD", "BAC"] },
      },
      {
        math: [tex`\therefore \triangle ADC\sim\triangle ACB`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ADC", "ACB"] },
        conclusion: true,
      },
      { heading: "(b) In △ABC,", highlights: { figures: ["ABC"] } },
      {
        math: [
          tex`\angle ABC+\angle ACB+\angle BAC=180^\circ`,
          tex`30^\circ+\angle ACB+60^\circ=180^\circ`,
          tex`\angle ACB=90^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["ABC", "ACB", "BAC"] },
      },
      {
        math: [tex`\because \triangle ADC\sim\triangle ACB`],
        reason: "proved in (a)",
        highlights: { figures: ["ADC", "ACB"] },
      },
      {
        math: [tex`\therefore \angle ADC=\angle ACB`, tex`=90^\circ`],
        reason: "corr. ∠s, ~△s",
        highlights: { angles: ["ADC", "ACB"] },
      },
      {
        text: "∴ △ADC is a right-angled triangle.",
        highlights: { figures: ["ADC"], angles: ["ADC"] },
      },
    ],
  },
};
