import type { TextbookSolution } from "./textbook-types";

const m = String.raw;
const smallCutting = "S1,S2,S3,S4,S5,S6,S7,S8";
const largeCutting = "L1,L2,L3,L4,L5,L6,L7,L8";
const smallHouse = "S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12";
const largeHouse = "L1,L2,L3,L4,L5,L6,L7,L8,L9,L10,L11,L12";

// Literal reading-order transcription, visually checked against solutions.pdf.
// In particular, no reasons are supplied where the printed reason column is blank.
export const textbookQuickAndD: Record<string, TextbookSolution> = {
  "qp8-1": {
    pages: [2],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because \triangle ABC\sim\triangle PQR`],
        highlights: { figures: ["ABC", "PQR"] },
      },
      {
        math: [m`\therefore \angle A=\angle P`, m`a=29^\circ`],
        reason: "(corr. ∠s, ∼△s)",
        highlights: { angles: ["BAC", "QPR"] },
      },
      {
        math: [
          m`\frac{AC}{PR}=\frac{AB}{PQ}`,
          m`\frac{b}{9}=\frac{8}{12}`,
          m`b=6`,
        ],
        reason: "(corr. sides, ∼△s)",
        highlights: { sides: ["AC", "PR", "AB", "PQ"] },
      },
      {
        math: [
          m`\frac{QR}{BC}=\frac{PQ}{AB}`,
          m`\frac{c}{4}=\frac{12}{8}`,
          m`c=6`,
        ],
        reason: "(corr. sides, ∼△s)",
        highlights: { sides: ["QR", "BC", "PQ", "AB"] },
      },
    ],
  },
  "qp8-2": {
    pages: [2],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because \triangle ABC\sim\triangle AED`],
        highlights: { figures: ["ABC", "AED"] },
      },
      {
        math: [m`\therefore \angle ABC=\angle AED`, m`=108^\circ`],
        reason: "(corr. ∠s, ∼△s)",
        highlights: { angles: ["ABC", "AED"] },
      },
      {
        heading: "In △ABC,",
        math: [
          m`\angle ABC+\angle ACB+47^\circ=180^\circ`,
          m`108^\circ+\angle ACB+47^\circ=180^\circ`,
          m`\angle ACB=25^\circ`,
        ],
        reason: "(∠ sum of △)",
        highlights: { angles: ["ABC", "ACB", "BAC"] },
      },
    ],
  },
  "qp8-3": {
    pages: [2],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because \triangle PQT\sim\triangle PSR`],
        highlights: { figures: ["PQT", "PSR"] },
      },
      {
        math: [
          m`\therefore \frac{PT}{PR}=\frac{QT}{SR}`,
          m`\frac{2.5}{x+4.5}=\frac{4}{12}`,
          m`30=4(x+4.5)`,
          m`30=4x+18`,
          m`12=4x`,
          m`x=3`,
        ],
        reason: "(corr. sides, ∼△s)",
        highlights: { sides: ["PT", "PR", "QT", "SR", "PQ"] },
      },
    ],
  },
  "qp8-4": {
    pages: [2],
    initialVisible: 6,
    steps: [
      {
        heading: "In △ABC and △QPR,",
        math: [m`\angle B=\angle P`],
        reason: "given",
        highlights: { angles: ["ABC", "QPR"] },
      },
      {
        math: [m`\angle C=\angle R`],
        reason: "given",
        highlights: { angles: ["BCA", "PRQ"] },
      },
      {
        math: [m`\because \angle A=180^\circ-110^\circ-25^\circ`, m`=45^\circ`],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "BCA"] },
      },
      {
        math: [m`\angle Q=180^\circ-110^\circ-25^\circ`, m`=45^\circ`],
        reason: "∠ sum of △",
        highlights: { angles: ["PQR", "QPR", "PRQ"] },
      },
      {
        math: [m`\therefore \angle A=\angle Q`],
        highlights: { angles: ["BAC", "PQR"] },
      },
      {
        math: [m`\therefore \triangle ABC\sim\triangle QPR`],
        reason: "AAA",
        conclusion: true,
        highlights: { figures: ["ABC", "QPR"] },
      },
    ],
  },
  "qp8-5": {
    pages: [2],
    initialVisible: 6,
    steps: [
      {
        heading: "In △PQR,",
        math: [
          m`\angle PQR+64^\circ+56^\circ=180^\circ`,
          m`\angle PQR=60^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["PQR", "PRQ", "QPR"] },
      },
      {
        heading: "In △PRS,",
        math: [
          m`\angle RPS+64^\circ+60^\circ=180^\circ`,
          m`\angle RPS=56^\circ`,
        ],
        reason: "∠ sum of △",
        highlights: { angles: ["RPS", "PSR", "PRS"] },
      },
      {
        heading: "In △PQR and △PRS,",
        math: [m`\angle PQR=\angle PRS`],
        highlights: { angles: ["PQR", "PRS"] },
      },
      {
        math: [m`\angle PRQ=\angle PSR`],
        reason: "given",
        highlights: { angles: ["PRQ", "PSR"] },
      },
      {
        math: [m`\angle QPR=\angle RPS`],
        highlights: { angles: ["QPR", "RPS"] },
      },
      {
        math: [m`\therefore \triangle PQR\sim\triangle PRS`],
        reason: "AAA",
        conclusion: true,
        highlights: { figures: ["PQR", "PRS"] },
      },
    ],
  },
  "qp8-6": {
    pages: [2],
    initialVisible: 5,
    steps: [
      {
        heading: "In △ABC and △QPR,",
        math: [
          m`\because \frac{QP}{AB}=\frac{4.2\text{ cm}}{3\text{ cm}}=\frac75`,
        ],
        highlights: { sides: ["QP", "AB"] },
      },
      {
        math: [m`\frac{RQ}{CA}=\frac{7\text{ cm}}{5\text{ cm}}=\frac75`],
        highlights: { sides: ["RQ", "CA"] },
      },
      {
        math: [m`\frac{PR}{BC}=\frac{8.4\text{ cm}}{6\text{ cm}}=\frac75`],
        highlights: { sides: ["PR", "BC"] },
      },
      {
        math: [m`\therefore \frac{QP}{AB}=\frac{RQ}{CA}=\frac{PR}{BC}`],
        highlights: { sides: ["QP", "AB", "RQ", "CA", "PR", "BC"] },
      },
      {
        math: [m`\therefore \triangle ABC\sim\triangle QPR`],
        reason: "3 sides prop.",
        conclusion: true,
        highlights: { figures: ["ABC", "QPR"] },
      },
    ],
  },
  "qp8-7": {
    pages: [2],
    initialVisible: 5,
    steps: [
      {
        heading: "In △PSR and △PRQ,",
        math: [m`\because \frac{PR}{PS}=\frac{10\text{ cm}}{5\text{ cm}}=2`],
        highlights: { sides: ["PR", "PS"] },
      },
      {
        math: [m`\frac{RQ}{SR}=\frac{16\text{ cm}}{8\text{ cm}}=2`],
        highlights: { sides: ["RQ", "SR"] },
      },
      {
        math: [m`\frac{PQ}{PR}=\frac{20\text{ cm}}{10\text{ cm}}=2`],
        highlights: { sides: ["PQ", "PR"] },
      },
      {
        math: [m`\therefore \frac{PR}{PS}=\frac{RQ}{SR}=\frac{PQ}{PR}`],
        highlights: { sides: ["PR", "PS", "RQ", "SR", "PQ"] },
      },
      {
        math: [m`\therefore \triangle PSR\sim\triangle PRQ`],
        reason: "3 sides prop.",
        conclusion: true,
        highlights: { figures: ["PSR", "PRQ"] },
      },
    ],
  },
  "qp8-8": {
    pages: [3],
    initialVisible: 5,
    steps: [
      {
        heading: "In △ABC and △RQP,",
        math: [
          m`\because \frac{RQ}{AB}=\frac{5.6\text{ cm}}{4.2\text{ cm}}=\frac43`,
        ],
        highlights: { sides: ["RQ", "AB"] },
      },
      {
        math: [m`\frac{RP}{AC}=\frac{3.6\text{ cm}}{2.7\text{ cm}}=\frac43`],
        highlights: { sides: ["RP", "AC"] },
      },
      {
        math: [m`\therefore \frac{RQ}{AB}=\frac{RP}{AC}`],
        highlights: { sides: ["RQ", "AB", "RP", "AC"] },
      },
      {
        math: [m`\angle A=\angle R`],
        reason: "given",
        highlights: { angles: ["BAC", "QRP"] },
      },
      {
        math: [m`\therefore \triangle ABC\sim\triangle RQP`],
        reason: "ratio of 2 sides, inc. ∠",
        conclusion: true,
        highlights: { figures: ["ABC", "RQP"] },
      },
    ],
  },
  "qp8-9": {
    pages: [3],
    initialVisible: 5,
    steps: [
      {
        heading: "(a) In △ACF and △ECB,",
        math: [
          m`\because \frac{EC}{AC}=\frac{6\text{ cm}}{(16+8)\text{ cm}}=\frac6{24}=\frac14`,
        ],
        highlights: { sides: ["EC", "AC", "AB", "BC"] },
      },
      {
        math: [
          m`\frac{CB}{CF}=\frac{8\text{ cm}}{(26+6)\text{ cm}}=\frac8{32}=\frac14`,
        ],
        highlights: { sides: ["CB", "CF", "FE", "EC"] },
      },
      {
        math: [m`\therefore \frac{EC}{AC}=\frac{CB}{CF}`],
        highlights: { sides: ["EC", "AC", "CB", "CF"] },
      },
      {
        math: [m`\angle ACF=\angle ECB`],
        reason: "common ∠",
        highlights: { angles: ["ACF", "ECB"] },
      },
      {
        math: [m`\therefore \triangle ACF\sim\triangle ECB`],
        reason: "ratio of 2 sides, inc. ∠",
        conclusion: true,
        highlights: { figures: ["ACF", "ECB"] },
      },
      {
        heading: "(b)",
        math: [m`\because \triangle ACF\sim\triangle ECB`],
        reason: "(proved in (a))",
        highlights: { figures: ["ACF", "ECB"] },
      },
      {
        math: [
          m`\therefore \frac{BE}{FA}=\frac{EC}{AC}`,
          m`\frac{BE}{16\text{ cm}}=\frac{6\text{ cm}}{24\text{ cm}}`,
          m`BE=4\text{ cm}`,
        ],
        reason: "(corr. sides, ∼△s)",
        highlights: { sides: ["BE", "FA", "EC", "AC"] },
      },
    ],
  },
  "qp8-10": {
    pages: [3],
    initialVisible: 4,
    steps: [
      {
        heading: "In △KPQ and △KSR,",
        math: [m`\angle PKQ=\angle SKR`],
        reason: "common ∠",
        highlights: { angles: ["PKQ", "SKR"] },
      },
      {
        math: [m`\angle KPQ=\angle KSR`],
        reason: "corr. ∠s, PQ // SR",
        highlights: { angles: ["KPQ", "KSR"], sides: ["PQ", "SR"] },
      },
      {
        math: [m`\angle PQK=\angle SRK`],
        reason: "corr. ∠s, PQ // SR",
        highlights: { angles: ["PQK", "SRK"], sides: ["PQ", "SR"] },
      },
      {
        math: [m`\therefore \triangle KPQ\sim\triangle KSR`],
        reason: "AAA",
        conclusion: true,
        highlights: { figures: ["KPQ", "KSR"] },
      },
    ],
  },
  "qp8-11": {
    pages: [3],
    initialVisible: 9,
    steps: [
      {
        heading: "In △ABE and △AFC,",
        math: [
          m`\angle ABE+\angle CBE=180^\circ`,
          m`\angle ABE=180^\circ-\angle CBE`,
        ],
        reason: "adj. ∠s on st. line",
        highlights: { angles: ["ABE", "CBE"] },
      },
      {
        math: [
          m`\angle AFC+\angle EFC=180^\circ`,
          m`\angle AFC=180^\circ-\angle EFC`,
        ],
        reason: "adj. ∠s on st. line",
        highlights: { angles: ["AFC", "EFC"] },
      },
      {
        math: [m`\because \angle CBE=\angle EFC`],
        highlights: { angles: ["CBE", "EFC"] },
      },
      {
        math: [m`\therefore \angle ABE=\angle AFC`],
        highlights: { angles: ["ABE", "AFC"] },
      },
      {
        math: [m`\angle BAE=\angle FAC`],
        reason: "common ∠",
        highlights: { angles: ["BAE", "FAC"] },
      },
      {
        math: [m`\because \angle AEB=180^\circ-\angle ABE-\angle BAE`],
        highlights: { angles: ["AEB", "ABE", "BAE"] },
      },
      {
        math: [m`\angle ACF=180^\circ-\angle AFC-\angle FAC`],
        highlights: { angles: ["ACF", "AFC", "FAC"] },
      },
      {
        math: [m`\therefore \angle AEB=\angle ACF`],
        highlights: { angles: ["AEB", "ACF"] },
      },
      {
        math: [m`\therefore \triangle ABE\sim\triangle AFC`],
        reason: "AAA",
        conclusion: true,
        highlights: { figures: ["ABE", "AFC"] },
      },
    ],
  },
  "qp8-12": {
    pages: [3],
    initialVisible: 5,
    steps: [
      {
        heading: "(a) In △PQS and △TRS,",
        math: [
          m`\because \frac{RS}{QS}=\frac{12\text{ cm}}{(6+12)\text{ cm}}=\frac{12}{18}=\frac23`,
        ],
        highlights: { sides: ["RS", "QS", "QR"] },
      },
      {
        math: [
          m`\frac{TS}{PS}=\frac{10\text{ cm}}{(5+10)\text{ cm}}=\frac{10}{15}=\frac23`,
        ],
        highlights: { sides: ["TS", "PS", "PT"] },
      },
      {
        math: [m`\therefore \frac{RS}{QS}=\frac{TS}{PS}`],
        highlights: { sides: ["RS", "QS", "TS", "PS"] },
      },
      {
        math: [m`\angle PSQ=\angle TSR`],
        reason: "common ∠",
        highlights: { angles: ["PSQ", "TSR"] },
      },
      {
        math: [m`\therefore \triangle PQS\sim\triangle TRS`],
        reason: "ratio of 2 sides, inc. ∠",
        conclusion: true,
        highlights: { figures: ["PQS", "TRS"] },
      },
      {
        heading: "(b)",
        math: [m`\because \triangle PQS\sim\triangle TRS`],
        reason: "(proved in (a))",
        highlights: { figures: ["PQS", "TRS"] },
      },
      {
        math: [m`\therefore \angle PQS=\angle TRS`],
        reason: "(corr. ∠s, ∼△s)",
        highlights: { angles: ["PQS", "TRS"] },
      },
      {
        math: [m`\therefore PQ\mathbin{//}TR`],
        reason: "(corr. ∠s equal)",
        highlights: { sides: ["PQ", "TR"] },
      },
    ],
  },
  "qp8-13": {
    pages: [3],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [m`\because ABCD\sim PQRS`],
        highlights: { figures: ["ABCD", "PQRS"] },
      },
      {
        math: [
          m`\therefore \frac{QR}{BC}=\frac{PQ}{AB}`,
          m`\frac{QR}{28\text{ cm}}=\frac{18}{24}`,
          m`QR=\frac{18}{24}\times28\text{ cm}`,
          m`=21\text{ cm}`,
        ],
        highlights: { sides: ["QR", "BC", "PQ", "AB"] },
      },
      {
        math: [m`\angle ADB=\angle PSQ`, m`=53^\circ`],
        highlights: { angles: ["ADB", "PSQ"] },
      },
      {
        heading: "(b)",
        math: [m`\because ABCD\sim PQRS`],
        highlights: { figures: ["ABCD", "PQRS"] },
      },
      {
        math: [
          m`\therefore \frac{\text{Perimeter of }ABCD}{\text{Perimeter of }PQRS}=\frac{AB}{PQ}`,
          m`\frac{\text{Perimeter of }ABCD}{60\text{ cm}}=\frac{24}{18}`,
          m`\text{Perimeter of }ABCD=\frac{24}{18}\times60\text{ cm}`,
          m`=80\text{ cm}`,
        ],
        highlights: { figures: ["ABCD", "PQRS"], sides: ["AB", "PQ"] },
      },
    ],
  },
  "qp8-14": {
    pages: [3, 4],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        text: "∵ The two figures are similar.",
        highlights: { figures: [smallCutting, largeCutting] },
      },
      {
        math: [m`\therefore \frac{w}{5}=\frac64`, m`w=\frac64\times5`, m`=7.5`],
        highlights: { sides: ["L1,L2", "S1,S2", "L3,L4", "S3,S4"] },
      },
      {
        heading: "(b)",
        text: "With the notation in the figure,",
        math: [m`\frac{x}{9}=\frac64`, m`x=\frac64\times9`, m`=13.5`],
        highlights: { figures: [smallCutting, largeCutting] },
      },
      {
        math: [
          m`\because \text{The height of the larger figure}`,
          m`=13.5\text{ cm}>12\text{ cm}`,
        ],
        highlights: { figures: [largeCutting] },
      },
      {
        text: "∴ The larger figure cannot be wholly pasted on the piece of card.",
        highlights: { figures: [largeCutting] },
      },
    ],
  },
  "ex8d-11": {
    pages: [14],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [m`\because ABCD\sim EDCF`],
        highlights: { figures: ["ABCD", "EDCF"] },
      },
      {
        math: [
          m`\therefore \frac{FC}{DC}=\frac{DC}{BC}`,
          m`\frac{FC}{6\text{ cm}}=\frac{6\text{ cm}}{9\text{ cm}}`,
          m`FC=\frac23\times6\text{ cm}`,
          m`=4\text{ cm}`,
        ],
        highlights: { sides: ["FC", "DC", "BC"] },
      },
      {
        math: [m`\therefore BF=BC-FC`, m`=(9-4)\text{ cm}`, m`=5\text{ cm}`],
        highlights: { sides: ["BF", "BC", "FC"] },
      },
    ],
  },
  "ex8d-12": {
    pages: [14],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because ABCD\sim EFGH`],
        highlights: { figures: ["ABCD", "EFGH"] },
      },
      {
        math: [
          m`\therefore \frac{FG}{BC}=\frac{EH}{AD}`,
          m`\frac{x}{2.7}=\frac{2}{1.2}`,
          m`x=\frac{2}{1.2}\times2.7`,
          m`=4.5`,
        ],
        highlights: { sides: ["FG", "BC", "EH", "AD"] },
      },
      {
        math: [m`\angle HEG=\angle DAC`, m`=38^\circ`],
        highlights: { angles: ["HEG", "DAC"] },
      },
      {
        heading: "In △EGH,",
        math: [
          m`y+\angle HEG+29^\circ=180^\circ`,
          m`y+38^\circ+29^\circ=180^\circ`,
          m`y=113^\circ`,
        ],
        reason: "(∠ sum of △)",
        highlights: { angles: ["EHG", "HEG", "EGH"] },
      },
    ],
  },
  "ex8d-13": {
    pages: [14],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because ABCDE\sim PQRST`],
        highlights: { figures: ["ABCDE", "PQRST"] },
      },
      {
        math: [
          m`\therefore \frac{\text{Perimeter of }PQRST}{\text{Perimeter of }ABCDE}=\frac{PR}{AC}`,
          m`\frac{54\text{ cm}}{30\text{ cm}}=\frac{PR}{8\text{ cm}}`,
          m`PR=\frac{54}{30}\times8\text{ cm}`,
          m`=14.4\text{ cm}`,
        ],
        highlights: { figures: ["PQRST", "ABCDE"], sides: ["PR", "AC"] },
      },
      {
        heading: "In △ACD,",
        math: [m`\because AD=AC`],
        highlights: { sides: ["AD", "AC"] },
      },
      {
        math: [m`\therefore \angle ADC=\angle ACD`, m`=58^\circ`],
        reason: "(base ∠s, isos. △)",
        highlights: { angles: ["ADC", "ACD"] },
      },
      {
        math: [
          m`\angle CAD+\angle ACD+\angle ADC=180^\circ`,
          m`\angle CAD+58^\circ+58^\circ=180^\circ`,
          m`\angle CAD=64^\circ`,
        ],
        reason: "(∠ sum of △)",
        highlights: { angles: ["CAD", "ACD", "ADC"] },
      },
      {
        math: [m`\because ABCDE\sim PQRST`],
        highlights: { figures: ["ABCDE", "PQRST"] },
      },
      {
        math: [m`\therefore \angle RPS=\angle CAD`, m`=64^\circ`],
        highlights: { angles: ["RPS", "CAD"] },
      },
    ],
  },
  "ex8d-14": {
    pages: [14],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because ABCDE\sim STUVW`],
        highlights: { figures: ["ABCDE", "STUVW"] },
      },
      {
        math: [
          m`\therefore \frac{VW}{DE}=\frac{TV}{BD}`,
          m`\frac{x-2}{x}=\frac7{10}`,
          m`10(x-2)=7x`,
          m`10x-20=7x`,
          m`3x=20`,
          m`x=\frac{20}{3}`,
        ],
        highlights: { sides: ["VW", "DE", "TV", "BD"] },
      },
    ],
  },
  "ex8d-15": {
    pages: [14, 15],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        text: "∵ The two figures are similar.",
        highlights: { figures: [largeHouse, smallHouse] },
      },
      {
        math: [
          m`\therefore \frac{x}{4}=\frac{9.6}{12}`,
          m`x=\frac{9.6}{12}\times4`,
          m`=3.2`,
        ],
        highlights: { sides: ["S3,S4", "L3,L4", "S10,S11", "L10,L11"] },
      },
      {
        math: [
          m`\frac{y}{10}=\frac{9.6}{12}`,
          m`y=\frac{9.6}{12}\times10`,
          m`=8`,
        ],
        highlights: { sides: ["S7,S10", "L7,L10", "S10,S11", "L10,L11"] },
      },
      {
        heading: "(b)",
        math: [
          m`\text{Width of the larger house}=(4+12+4)\text{ cm}=20\text{ cm}`,
        ],
        highlights: { sides: ["L1,L8", "L1,L12", "L10,L11", "L8,L9"] },
      },
      {
        math: [
          m`\frac{\text{Width of the smaller house}}{\text{Width of the larger house}}=\frac{9.6}{12}`,
          m`\frac{\text{Width of the smaller house}}{20\text{ cm}}=\frac{9.6}{12}`,
          m`\text{Width of the smaller house}=\frac{9.6}{12}\times20\text{ cm}`,
          m`=16\text{ cm}`,
        ],
        highlights: { sides: ["S1,S8", "L1,L8"] },
      },
      {
        math: [
          m`\text{Height of the larger house}=(4+10)\text{ cm}=14\text{ cm}`,
        ],
        highlights: { figures: [largeHouse] },
      },
      {
        math: [
          m`\frac{\text{Height of the smaller house}}{\text{Height of the larger house}}=\frac{9.6}{12}`,
          m`\frac{\text{Height of the smaller house}}{14\text{ cm}}=\frac{9.6}{12}`,
          m`\text{Height of the smaller house}=\frac{9.6}{12}\times14\text{ cm}`,
          m`=11.2\text{ cm}`,
        ],
        highlights: { figures: [smallHouse, largeHouse] },
      },
      {
        text: "∴ The dimensions of the paper are 16 cm × 11.2 cm (or 11.2 cm × 16 cm).",
        highlights: { figures: [smallHouse] },
      },
    ],
  },
  "ex8d-16": {
    pages: [15],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [m`\because ABCD\sim EFGH`],
        highlights: { figures: ["ABCD", "EFGH"] },
      },
      {
        math: [
          m`\therefore \frac{EF}{AB}=\frac{FG}{BC}`,
          m`\frac{EF}{a\text{ cm}}=\frac{4\text{ cm}}{3\text{ cm}}`,
          m`EF=\frac{4a}{3}\text{ cm}`,
        ],
        highlights: { sides: ["EF", "AB", "FG", "BC"] },
      },
      {
        heading: "(b)",
        math: [
          m`\text{Area of }ABCD:\text{area of }EFGH`,
          m`=AB\times BC:EF\times FG`,
          m`=(a\times3):\left(\frac{4a}{3}\times4\right)`,
          m`=3a:\frac{16a}{3}`,
          m`=9a:16a`,
          m`=9:16`,
        ],
        highlights: { figures: ["ABCD", "EFGH"] },
      },
    ],
  },
  "ex8d-17": {
    pages: [15],
    initialVisible: 2,
    steps: [
      {
        text: "∵ ABCD and DEFG are two squares.",
        highlights: { figures: ["ABCD", "DEFG"] },
      },
      {
        math: [m`\therefore ABCD\sim FGDE`],
        conclusion: true,
        highlights: { figures: ["ABCD", "FGDE"] },
      },
      {
        math: [
          m`\therefore \frac{AD}{FE}=\frac{AC}{FD}`,
          m`\frac{3+GD}{GD}=\frac75`,
          m`15\text{ cm}+5GD=7GD`,
          m`2GD=15\text{ cm}`,
          m`GD=7.5\text{ cm}`,
        ],
        highlights: { sides: ["AD", "FE", "AC", "FD", "GD", "AG"] },
      },
      {
        math: [m`DE=GD`, m`=7.5\text{ cm}`],
        highlights: { sides: ["DE", "GD"] },
      },
      {
        math: [m`CD=AD`, m`=AG+GD`, m`=(3+7.5)\text{ cm}`, m`=10.5\text{ cm}`],
        highlights: { sides: ["CD", "AD", "AG", "GD"] },
      },
      {
        math: [
          m`\therefore CE=DE+CD`,
          m`=(7.5+10.5)\text{ cm}`,
          m`=18\text{ cm}`,
        ],
        highlights: { sides: ["CE", "DE", "CD"] },
      },
    ],
  },
  "ex8d-18": {
    pages: [15],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [m`\because ABCF\sim FCDE`],
        highlights: { figures: ["ABCF", "FCDE"] },
      },
      {
        math: [
          m`\therefore \frac{EF}{FA}=\frac{CF}{BA}`,
          m`\frac{EF}{5\text{ cm}}=\frac{2\text{ cm}}{6\text{ cm}}`,
          m`EF=\frac53\text{ cm}`,
        ],
        highlights: { sides: ["EF", "FA", "CF", "BA"] },
      },
      {
        math: [
          m`\frac{DE}{CF}=\frac{CF}{BA}`,
          m`\frac{DE}{2\text{ cm}}=\frac{2\text{ cm}}{6\text{ cm}}`,
          m`DE=\frac23\text{ cm}`,
        ],
        highlights: { sides: ["DE", "CF", "BA"] },
      },
      {
        heading: "(b)",
        math: [m`\because ABCF\sim FCDE`],
        highlights: { figures: ["ABCF", "FCDE"] },
      },
      {
        math: [m`\therefore \angle FAB=\angle EFC`],
        highlights: { angles: ["FAB", "EFC"] },
      },
      {
        math: [m`\therefore AB\mathbin{//}FC`],
        reason: "(corr. ∠s equal)",
        highlights: { sides: ["AB", "FC"] },
      },
    ],
  },
  "ex8d-19": {
    pages: [15],
    initialVisible: 5,
    steps: [
      {
        text: "∵ AF and CD are two adjacent sides of the pair of equal adjacent sides (i.e. AB and BC) of ABCDEF; PU and RS are two adjacent sides of the pair of equal adjacent sides (i.e. PQ and QR) of PQRSTU.",
        highlights: { sides: ["AF", "CD", "AB", "BC", "PU", "RS", "PQ", "QR"] },
      },
      {
        text: "∴ The longer side AF corresponds to PU and the shorter side CD corresponds to RS.",
        highlights: { sides: ["AF", "PU", "CD", "RS"] },
      },
      {
        math: [
          m`\frac{PU}{AF}=\frac74\quad\text{and}\quad\frac{RS}{CD}=\frac42=2`,
        ],
        highlights: { sides: ["PU", "AF", "RS", "CD"] },
      },
      {
        math: [m`\because \frac{PU}{AF}\ne\frac{RS}{CD}`],
        highlights: { sides: ["PU", "AF", "RS", "CD"] },
      },
      {
        text: "∴ ABCDEF and PQRSTU are not similar.",
        conclusion: true,
        highlights: { figures: ["ABCDEF", "PQRSTU"] },
      },
      {
        heading: "Alternative Solution",
        text: "∵ AF and PU are the second longest sides of ABCDEF and PQRSTU respectively; EF and TU are the shortest sides of ABCDEF and PQRSTU respectively.",
        highlights: { sides: ["AF", "PU", "EF", "TU"] },
      },
      {
        text: "∴ AF corresponds to PU and EF corresponds to TU.",
        highlights: { sides: ["AF", "PU", "EF", "TU"] },
      },
      {
        math: [
          m`\frac{PU}{AF}=\frac74\quad\text{and}\quad\frac{TU}{EF}=\frac31=3`,
        ],
        highlights: { sides: ["PU", "AF", "TU", "EF"] },
      },
      {
        math: [m`\because \frac{PU}{AF}\ne\frac{TU}{EF}`],
        highlights: { sides: ["PU", "AF", "TU", "EF"] },
      },
      {
        text: "∴ ABCDEF and PQRSTU are not similar.",
        conclusion: true,
        highlights: { figures: ["ABCDEF", "PQRSTU"] },
      },
    ],
  },
  "ex8d-20": {
    pages: [15],
    initialVisible: 7,
    steps: [
      {
        heading: "In PQRS,",
        math: [
          m`110^\circ+80^\circ+\angle R+100^\circ=(4-2)\times180^\circ`,
          m`290^\circ+\angle R=360^\circ`,
          m`\angle R=70^\circ`,
        ],
        reason: "(∠ sum of polygon)",
        highlights: { angles: ["SPQ", "PQR", "QRS", "RSP"] },
      },
      {
        heading: "In WXYZ,",
        math: [
          m`\angle W+70^\circ+80^\circ+110^\circ=(4-2)\times180^\circ`,
          m`\angle W+260^\circ=360^\circ`,
          m`\angle W=100^\circ`,
        ],
        reason: "(∠ sum of polygon)",
        highlights: { angles: ["ZWX", "WXY", "XYZ", "YZW"] },
      },
      {
        math: [
          m`\because \angle P=\angle Z=110^\circ,\ \angle Q=\angle Y=80^\circ,\ \angle R=\angle X=70^\circ`,
          m`\text{and }\angle S=\angle W=100^\circ.`,
        ],
        highlights: {
          angles: ["SPQ", "YZW", "PQR", "XYZ", "QRS", "WXY", "RSP", "ZWX"],
        },
      },
      {
        text: "∴ P, Q, R, S correspond to Z, Y, X, W respectively.",
        highlights: { points: ["P", "Q", "R", "S", "Z", "Y", "X", "W"] },
      },
      {
        math: [
          m`\frac{ZY}{PQ}=\frac{16}{12}=\frac43\quad\text{and}\quad\frac{YX}{QR}=\frac{24}{15}=\frac85`,
        ],
        highlights: { sides: ["ZY", "PQ", "YX", "QR"] },
      },
      {
        math: [m`\because \frac{ZY}{PQ}\ne\frac{YX}{QR}`],
        highlights: { sides: ["ZY", "PQ", "YX", "QR"] },
      },
      {
        text: "∴ PQRS and WXYZ are not similar.",
        conclusion: true,
        highlights: { figures: ["PQRS", "WXYZ"] },
      },
    ],
  },
};
