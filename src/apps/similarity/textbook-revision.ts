import type { TextbookSolution } from "./textbook-types";

const m = String.raw;

// Transcribed from the supplied Full Solutions PDF, pages 19–22.
// Printed wording, fraction direction, order and reasons are retained, including
// the source's ∠ACE in the first straight-line equation of Question 25(b).
export const textbookRevision: Record<string, TextbookSolution> = {
  "rev8-23": {
    pages: [19],
    initialVisible: 1,
    steps: [
      {
        math: [m`\angle BKH+105^\circ=180^\circ`, m`\angle BKH=75^\circ`],
        reason: "(adj. ∠s on st. line)",
        highlights: { angles: ["BKH", "HKC"], sides: ["BC"] },
      },
      {
        math: [m`\because\ \triangle ABC\sim\triangle KBH`],
        highlights: { figures: ["ABC", "KBH"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle BKH`, m`=75^\circ`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["BAC", "BKH"] },
      },
      {
        math: [
          m`\frac{AB}{KB}=\frac{BC}{BH}`,
          m`\frac{AH+7\text{ cm}}{5\text{ cm}}=\frac{(5+9)\text{ cm}}{7\text{ cm}}`,
          m`\frac{AH+7\text{ cm}}{5\text{ cm}}=2`,
          m`AH+7\text{ cm}=10\text{ cm}`,
          m`AH=3\text{ cm}`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["AB", "KB", "BC", "BH", "AH", "KC"] },
      },
    ],
  },
  "rev8-24": {
    pages: [19],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because\ \triangle ABC\sim\triangle DCB`],
        highlights: { figures: ["ABC", "DCB"] },
      },
      {
        math: [m`\therefore\ \angle CDB=\angle BAC`, m`x=100^\circ`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["CDB", "BAC"] },
      },
      {
        math: [m`\angle DBC=\angle ACB`, m`=y`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["DBC", "ACB"] },
      },
      {
        heading: "In △ABC,",
        math: [
          m`\angle BAC+\angle ABC+\angle ACB=180^\circ`,
          m`100^\circ+(20^\circ+y)+y=180^\circ`,
          m`120^\circ+2y=180^\circ`,
          m`2y=60^\circ`,
          m`y=30^\circ`,
        ],
        reason: "(∠ sum of △)",
        highlights: {
          angles: ["BAC", "ABC", "ACB", "ABD", "DBC"],
          figures: ["ABC"],
        },
      },
    ],
  },
  "rev8-25": {
    pages: [19],
    initialVisible: 3,
    sourceNote:
      "The first straight-line equation in the printed solution to (b) uses ∠ACE. This is a source angle-label error: the equation should use ∠DCE, since the three adjacent angles on BCD are ∠ACB, ∠ACE and ∠DCE, with ∠ACE = 60°. The textbook equation is preserved exactly in the solution steps.",
    steps: [
      {
        heading: "(a) In △ABC and △DEC,",
        math: [
          m`\because\ \frac{DE}{AB}=\frac{7\text{ cm}}{14\text{ cm}}=\frac12`,
          m`\frac{EC}{BC}=\frac{8\text{ cm}}{16\text{ cm}}=\frac12`,
          m`\frac{DC}{AC}=\frac{5\text{ cm}}{10\text{ cm}}=\frac12`,
        ],
        highlights: { sides: ["DE", "AB", "EC", "BC", "DC", "AC"] },
      },
      {
        math: [m`\therefore\ \frac{DE}{AB}=\frac{EC}{BC}=\frac{DC}{AC}`],
        highlights: { sides: ["DE", "AB", "EC", "BC", "DC", "AC"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle DEC`],
        reason: "3 sides prop.",
        highlights: { figures: ["ABC", "DEC"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle ABC\sim\triangle DEC`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "DEC"] },
      },
      {
        math: [m`\therefore\ \angle ACB=\angle DCE`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["ACB", "DCE"] },
      },
      {
        math: [
          m`\angle ACB+\angle ACE+60^\circ=180^\circ`,
          m`2\angle ACB+60^\circ=180^\circ`,
          m`2\angle ACB=120^\circ`,
          m`\angle ACB=60^\circ`,
        ],
        reason: "(adj. ∠s on st. line)",
        highlights: { angles: ["ACB", "ACE"], sides: ["BD"] },
      },
    ],
  },
  "rev8-26": {
    pages: [19],
    initialVisible: 4,
    steps: [
      {
        heading: "(a) In △ABC and △DEF,",
        math: [
          m`\because\ \frac{DE}{AB}=\frac{12\text{ cm}}{8\text{ cm}}=\frac32`,
          m`\frac{EF}{BC}=\frac{9\text{ cm}}{6\text{ cm}}=\frac32`,
        ],
        highlights: { sides: ["DE", "AB", "EF", "BC"] },
      },
      {
        math: [m`\therefore\ \frac{DE}{AB}=\frac{EF}{BC}`],
        highlights: { sides: ["DE", "AB", "EF", "BC"] },
      },
      {
        math: [m`\angle ABC=\angle DEF`],
        reason: "given",
        highlights: { angles: ["ABC", "DEF"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle DEF`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABC", "DEF"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle ABC\sim\triangle DEF`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "DEF"] },
      },
      {
        math: [
          m`\therefore\ \frac{DF}{AC}=\frac{DE}{AB}`,
          m`\frac{13\text{ cm}+CF}{CF+7\text{ cm}}=\frac{12\text{ cm}}{8\text{ cm}}`,
          m`\frac{13\text{ cm}+CF}{CF+7\text{ cm}}=\frac32`,
          m`26\text{ cm}+2CF=3CF+21\text{ cm}`,
          m`CF=5\text{ cm}`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["DF", "AC", "DE", "AB", "CF", "CD", "AF"] },
      },
    ],
  },
  "rev8-27": {
    pages: [19],
    initialVisible: 8,
    steps: [
      {
        heading: "In △BDE and △CEF,",
        math: [m`\angle DEB=\angle EFC`],
        reason: "given",
        highlights: { angles: ["DEB", "EFC"] },
      },
      {
        math: [m`\because\ AB=AC`],
        reason: "given",
        highlights: { sides: ["AB", "AC"] },
      },
      {
        math: [m`\therefore\ \angle ABC=\angle BCA`],
        reason: "base ∠s, isos. △",
        highlights: { angles: ["ABC", "BCA"], figures: ["ABC"] },
      },
      {
        math: [m`\text{i.e.}\quad\angle DBE=\angle ECF`],
        highlights: { angles: ["DBE", "ECF"] },
      },
      {
        math: [m`\because\ \angle BDE=180^\circ-\angle DEB-\angle DBE`],
        reason: "∠ sum of △",
        highlights: { angles: ["BDE", "DEB", "DBE"], figures: ["BDE"] },
      },
      {
        math: [m`\angle CEF=180^\circ-\angle EFC-\angle ECF`],
        reason: "∠ sum of △",
        highlights: { angles: ["CEF", "EFC", "ECF"], figures: ["CEF"] },
      },
      {
        math: [m`\therefore\ \angle BDE=\angle CEF`],
        highlights: { angles: ["BDE", "CEF"] },
      },
      {
        math: [m`\therefore\ \triangle BDE\sim\triangle CEF`],
        reason: "AAA",
        highlights: { figures: ["BDE", "CEF"] },
        conclusion: true,
      },
    ],
  },
  "rev8-28": {
    pages: [19, 20],
    initialVisible: 6,
    steps: [
      {
        heading: "(a) In △ABC and △DAC,",
        math: [m`\angle ABC=\angle DAC`],
        reason: "given",
        highlights: { angles: ["ABC", "DAC"] },
      },
      {
        math: [m`\angle ACB=\angle DCA`],
        reason: "common ∠",
        highlights: { angles: ["ACB", "DCA"] },
      },
      {
        math: [m`\because\ \angle BAC=180^\circ-\angle ABC-\angle ACB`],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "ACB"], figures: ["ABC"] },
      },
      {
        math: [m`\angle ADC=180^\circ-\angle DAC-\angle DCA`],
        reason: "∠ sum of △",
        highlights: { angles: ["ADC", "DAC", "DCA"], figures: ["DAC"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle ADC`],
        highlights: { angles: ["BAC", "ADC"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle DAC`],
        reason: "AAA",
        highlights: { figures: ["ABC", "DAC"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`90^\circ+\angle ADC=180^\circ`, m`\angle ADC=90^\circ`],
        reason: "(adj. ∠s on st. line)",
        highlights: { angles: ["ADB", "ADC"], sides: ["BC"] },
      },
      {
        math: [m`\because\ \triangle ABC\sim\triangle DAC`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "DAC"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle ADC`, m`=90^\circ`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["BAC", "ADC"] },
      },
      {
        math: [m`\therefore\ BA\perp AC`],
        highlights: { sides: ["BA", "AC"], angles: ["BAC"] },
      },
    ],
  },
  "rev8-29": {
    pages: [20],
    initialVisible: 4,
    steps: [
      {
        heading: "(a) In △ABO and △CDO,",
        math: [
          m`\because\ \frac{CO}{AO}=\frac{6\text{ cm}}{3\text{ cm}}=2`,
          m`\frac{DO}{BO}=\frac{8\text{ cm}}{4\text{ cm}}=2`,
        ],
        highlights: { sides: ["CO", "AO", "DO", "BO"] },
      },
      {
        math: [m`\therefore\ \frac{CO}{AO}=\frac{DO}{BO}`],
        highlights: { sides: ["CO", "AO", "DO", "BO"] },
      },
      {
        math: [m`\angle AOB=\angle COD`],
        reason: "vert. opp. ∠s",
        highlights: { angles: ["AOB", "COD"] },
      },
      {
        math: [m`\therefore\ \triangle ABO\sim\triangle CDO`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABO", "CDO"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle ABO\sim\triangle CDO`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABO", "CDO"] },
      },
      {
        math: [m`\therefore\ \angle ABO=\angle CDO`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["ABO", "CDO"] },
      },
      {
        math: [m`\therefore\ AB\mathbin{//}DC`],
        reason: "(alt. ∠s equal)",
        highlights: { sides: ["AB", "DC"], angles: ["ABO", "CDO"] },
      },
    ],
  },
  "rev8-30": {
    pages: [20],
    initialVisible: 3,
    steps: [
      {
        heading: "(a) In △ABC and △CED,",
        math: [
          m`\because\ \frac{CE}{AB}=\frac{8\text{ cm}}{12\text{ cm}}=\frac23`,
          m`\frac{ED}{BC}=\frac{6\text{ cm}}{9\text{ cm}}=\frac23`,
          m`\frac{CD}{AC}=\frac{12\text{ cm}}{(10+8)\text{ cm}}=\frac{12}{18}=\frac23`,
        ],
        highlights: { sides: ["CE", "AB", "ED", "BC", "CD", "AC", "AE"] },
      },
      {
        math: [m`\therefore\ \frac{CE}{AB}=\frac{ED}{BC}=\frac{CD}{AC}`],
        highlights: { sides: ["CE", "AB", "ED", "BC", "CD", "AC"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle CED`],
        reason: "3 sides prop.",
        highlights: { figures: ["ABC", "CED"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle ABC\sim\triangle CED`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "CED"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle ECD`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["BAC", "ECD"] },
      },
      {
        math: [m`\therefore\ AB\mathbin{//}DC`],
        reason: "(alt. ∠s equal)",
        highlights: { sides: ["AB", "DC"], angles: ["BAC", "ECD"] },
      },
    ],
  },
  "rev8-31": {
    pages: [20],
    initialVisible: 4,
    steps: [
      {
        heading: "(a) In △ABC and △CDE,",
        math: [
          m`\because\ \frac{CD}{AB}=\frac{12\text{ cm}}{16\text{ cm}}=\frac34`,
          m`\frac{DE}{BC}=\frac{15\text{ cm}}{20\text{ cm}}=\frac34`,
        ],
        highlights: { sides: ["CD", "AB", "DE", "BC"] },
      },
      {
        math: [m`\therefore\ \frac{CD}{AB}=\frac{DE}{BC}`],
        highlights: { sides: ["CD", "AB", "DE", "BC"] },
      },
      {
        math: [m`\angle ABC=\angle CDE`],
        reason: "given",
        highlights: { angles: ["ABC", "CDE"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle CDE`],
        reason: "ratio of 2 sides, inc. ∠",
        highlights: { figures: ["ABC", "CDE"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle ABC\sim\triangle CDE`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "CDE"] },
      },
      {
        math: [m`\therefore\ \angle ACB=\angle CED`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["ACB", "CED"] },
      },
      {
        math: [m`\therefore\ CB\mathbin{//}DE`],
        reason: "(alt. ∠s equal)",
        highlights: { sides: ["CB", "DE"], angles: ["ACB", "CED"] },
      },
      {
        math: [
          m`\angle CDE+\angle BCD=180^\circ`,
          m`90^\circ+\angle BCD=180^\circ`,
          m`\angle BCD=90^\circ`,
        ],
        reason: "(int. ∠s, CB // DE)",
        highlights: { angles: ["CDE", "BCD"], sides: ["CB", "DE"] },
      },
      {
        math: [m`\therefore\ DC\perp CB`],
        highlights: { sides: ["DC", "CB"], angles: ["BCD"] },
      },
      {
        heading: "Alternative Solution",
        math: [m`\because\ \triangle ABC\sim\triangle CDE`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "CDE"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle DCE`],
        reason: "(corr. ∠s, ~△s)",
        highlights: { angles: ["BAC", "DCE"] },
      },
      {
        heading: "In △ABC,",
        math: [
          m`\angle BAC+\angle ACB+90^\circ=180^\circ`,
          m`\angle BAC+\angle ACB=90^\circ`,
          m`\angle DCE+\angle ACB=90^\circ`,
        ],
        reason: "(∠ sum of △)",
        highlights: { angles: ["BAC", "ACB", "ABC", "DCE"], figures: ["ABC"] },
      },
      {
        math: [m`\text{i.e.}\quad\angle DCB=90^\circ`],
        highlights: { angles: ["DCB"] },
      },
      {
        math: [m`\therefore\ DC\perp CB`],
        highlights: { sides: ["DC", "CB"], angles: ["DCB"] },
      },
    ],
  },
  "rev8-32": {
    pages: [20],
    initialVisible: 13,
    steps: [
      {
        heading: "(a) In △ABC and △ACD,",
        math: [m`\angle BAC=\angle CAD`],
        reason: "common ∠",
        highlights: { angles: ["BAC", "CAD"] },
      },
      {
        math: [m`\angle ACB=\angle ADC`],
        reason: "given",
        highlights: { angles: ["ACB", "ADC"] },
      },
      {
        math: [m`\because\ \angle ABC=180^\circ-\angle BAC-\angle ACB`],
        reason: "∠ sum of △",
        highlights: { angles: ["ABC", "BAC", "ACB"], figures: ["ABC"] },
      },
      {
        math: [m`\angle ACD=180^\circ-\angle CAD-\angle ADC`],
        reason: "∠ sum of △",
        highlights: { angles: ["ACD", "CAD", "ADC"], figures: ["ACD"] },
      },
      {
        math: [m`\therefore\ \angle ABC=\angle ACD`],
        highlights: { angles: ["ABC", "ACD"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle ACD`],
        reason: "AAA",
        highlights: { figures: ["ABC", "ACD"] },
        conclusion: true,
      },
      {
        heading: "In △ABC and △CBD,",
        math: [m`\angle ABC=\angle CBD`],
        reason: "common ∠",
        highlights: { angles: ["ABC", "CBD"] },
      },
      {
        math: [m`\angle CDB+90^\circ=180^\circ`, m`\angle CDB=90^\circ`],
        reason: "adj. ∠s on st. line",
        highlights: { angles: ["CDB", "ADC"], sides: ["AB"] },
      },
      {
        math: [m`\therefore\ \angle ACB=\angle CDB`],
        highlights: { angles: ["ACB", "CDB"] },
      },
      {
        math: [m`\because\ \angle BAC=180^\circ-\angle ABC-\angle ACB`],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "ACB"], figures: ["ABC"] },
      },
      {
        math: [m`\angle BCD=180^\circ-\angle CBD-\angle CDB`],
        reason: "∠ sum of △",
        highlights: { angles: ["BCD", "CBD", "CDB"], figures: ["CBD"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle BCD`],
        highlights: { angles: ["BAC", "BCD"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle CBD`],
        reason: "AAA",
        highlights: { figures: ["ABC", "CBD"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [
          m`\because\ \triangle ABC\sim\triangle ACD\text{ and }\triangle ABC\sim\triangle CBD`,
        ],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "ACD", "CBD"] },
      },
      {
        math: [m`\therefore\ \triangle ACD\sim\triangle CBD`],
        highlights: { figures: ["ACD", "CBD"] },
        conclusion: true,
      },
      {
        math: [
          m`\therefore\ \frac{BD}{CD}=\frac{CD}{AD}`,
          m`\frac{BD}{6\text{ cm}}=\frac{6\text{ cm}}{4\text{ cm}}`,
          m`BD=9\text{ cm}`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["BD", "CD", "AD"] },
      },
    ],
  },
  "rev8-33": {
    pages: [20, 21],
    initialVisible: 4,
    steps: [
      {
        heading: "(a) (i) In △AGF and △BEF,",
        math: [m`\angle AFG=\angle BFE`],
        reason: "vert. opp. ∠s",
        highlights: { angles: ["AFG", "BFE"] },
      },
      {
        math: [m`\angle AGF=\angle BEF`],
        reason: "alt. ∠s, AC // EB",
        highlights: { angles: ["AGF", "BEF"], sides: ["AC", "EB"] },
      },
      {
        math: [m`\angle GAF=\angle EBF`],
        reason: "alt. ∠s, AC // EB",
        highlights: { angles: ["GAF", "EBF"], sides: ["AC", "EB"] },
      },
      {
        math: [m`\therefore\ \triangle AGF\sim\triangle BEF`],
        reason: "AAA",
        highlights: { figures: ["AGF", "BEF"] },
        conclusion: true,
      },
      {
        heading: "(ii) In △ADG and △DBE,",
        math: [m`\angle DAG=\angle BDE`],
        reason: "given",
        highlights: { angles: ["DAG", "BDE"] },
      },
      {
        math: [m`\because\ AC\perp DE`],
        reason: "given",
        highlights: { sides: ["AC", "DE"] },
      },
      {
        math: [m`\therefore\ \angle AGF=90^\circ`],
        highlights: { angles: ["AGF"] },
      },
      {
        math: [m`\angle DEB=\angle AGF`, m`=90^\circ`],
        reason: "alt. ∠s, AG // EB",
        highlights: { angles: ["DEB", "AGF"], sides: ["AG", "EB"] },
      },
      {
        math: [m`\therefore\ \angle AGD=\angle DEB`],
        highlights: { angles: ["AGD", "DEB"] },
      },
      {
        math: [m`AD=DB`],
        reason: "given",
        highlights: { sides: ["AD", "DB"] },
      },
      {
        math: [m`\therefore\ \triangle ADG\cong\triangle DBE`],
        reason: "AAS",
        highlights: { figures: ["ADG", "DBE"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle AGF\sim\triangle BEF`],
        reason: "(proved in (a)(i))",
        highlights: { figures: ["AGF", "BEF"] },
      },
      {
        math: [
          m`\therefore\ \frac{AG}{BE}=\frac{AF}{BF}`,
          m`\frac{AG}{BE}=\frac21`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["AG", "BE", "AF", "BF"] },
      },
      {
        math: [m`\therefore\ AG=2BE`],
        highlights: { sides: ["AG", "BE"] },
      },
      {
        math: [m`\because\ \triangle ADG\cong\triangle DBE`],
        reason: "(proved in (a)(ii))",
        highlights: { figures: ["ADG", "DBE"] },
      },
      {
        math: [m`\therefore\ BE=DG`],
        reason: "(corr. sides, ≅△s)",
        highlights: { sides: ["BE", "DG"] },
      },
      {
        math: [m`\text{and}\quad DE=AG`, m`=2BE`, m`=2DG`],
        reason: "(corr. sides, ≅△s)",
        highlights: { sides: ["DE", "AG", "BE", "DG"] },
      },
      {
        math: [
          m`\frac{DG}{EG}=\frac{DG}{DE-DG}`,
          m`=\frac{DG}{2DG-DG}`,
          m`=\frac{DG}{DG}`,
          m`=\frac11`,
        ],
        highlights: { sides: ["DG", "EG", "DE"] },
      },
      {
        math: [m`\therefore\ DG:EG=1:1`],
        highlights: { sides: ["DG", "EG"] },
      },
    ],
  },
  "rev8-34": {
    pages: [21],
    initialVisible: 6,
    steps: [
      {
        heading: "(a) In △ABC and △DEC,",
        math: [m`\angle ABC=\angle DEC`],
        reason: "given",
        highlights: { angles: ["ABC", "DEC"] },
      },
      {
        math: [m`\angle ACB=\angle DCE`],
        reason: "common ∠",
        highlights: { angles: ["ACB", "DCE"] },
      },
      {
        math: [m`\because\ \angle BAC=180^\circ-\angle ABC-\angle ACB`],
        reason: "∠ sum of △",
        highlights: { angles: ["BAC", "ABC", "ACB"], figures: ["ABC"] },
      },
      {
        math: [m`\angle EDC=180^\circ-\angle DEC-\angle DCE`],
        reason: "∠ sum of △",
        highlights: { angles: ["EDC", "DEC", "DCE"], figures: ["DEC"] },
      },
      {
        math: [m`\therefore\ \angle BAC=\angle EDC`],
        highlights: { angles: ["BAC", "EDC"] },
      },
      {
        math: [m`\therefore\ \triangle ABC\sim\triangle DEC`],
        reason: "AAA",
        highlights: { figures: ["ABC", "DEC"] },
        conclusion: true,
      },
      {
        heading: "(b)",
        math: [m`\because\ \triangle ABC\sim\triangle DEC`],
        reason: "(proved in (a))",
        highlights: { figures: ["ABC", "DEC"] },
      },
      {
        math: [
          m`\therefore\ \frac{DE}{AB}=\frac{EC}{BC}`,
          m`\frac{DE}{3\text{ m}}=\frac{3\text{ m}}{(4+3)\text{ m}}`,
          m`DE=\frac37\times3\text{ m}`,
          m`=\frac97\text{ m}`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["DE", "AB", "EC", "BC", "BE"] },
      },
      {
        math: [
          m`\therefore\ \text{The height of the child is }\frac97\text{ m}.`,
        ],
        highlights: { sides: ["DE"] },
      },
    ],
  },
  "rev8-35": {
    pages: [21],
    initialVisible: 6,
    steps: [
      {
        heading: "(a) In △APS and △CRS,",
        math: [m`\angle APS=\angle CRS`],
        reason: "(given)",
        highlights: { angles: ["APS", "CRS"] },
      },
      {
        math: [m`\angle ASP=\angle CSR`],
        reason: "(common ∠)",
        highlights: { angles: ["ASP", "CSR"] },
      },
      {
        math: [m`\because\ \angle PAS=180^\circ-\angle APS-\angle ASP`],
        reason: "(∠ sum of △)",
        highlights: { angles: ["PAS", "APS", "ASP"], figures: ["APS"] },
      },
      {
        math: [m`\angle RCS=180^\circ-\angle CRS-\angle CSR`],
        reason: "(∠ sum of △)",
        highlights: { angles: ["RCS", "CRS", "CSR"], figures: ["CRS"] },
      },
      {
        math: [m`\therefore\ \angle PAS=\angle RCS`],
        highlights: { angles: ["PAS", "RCS"] },
      },
      {
        math: [m`\therefore\ \triangle APS\sim\triangle CRS`],
        reason: "(AAA)",
        highlights: { figures: ["APS", "CRS"] },
        conclusion: true,
      },
      {
        math: [
          m`\therefore\ \frac{PS}{RS}=\frac{AP}{CR}`,
          m`\frac{PS}{3\text{ m}}=\frac{7\text{ m}}{1.6\text{ m}}`,
          m`PS=\frac{3}{1.6}\times7\text{ m}`,
          m`=13.125\text{ m}`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["PS", "RS", "AP", "CR"] },
      },
      {
        heading: "(b) In △BTQ and △CRQ,",
        math: [m`\angle BTQ=\angle CRQ`],
        reason: "(given)",
        highlights: { angles: ["BTQ", "CRQ"] },
      },
      {
        math: [m`\angle BQT=\angle CQR`],
        reason: "(common ∠)",
        highlights: { angles: ["BQT", "CQR"] },
      },
      {
        math: [m`\because\ \angle TBQ=180^\circ-\angle BTQ-\angle BQT`],
        reason: "(∠ sum of △)",
        highlights: { angles: ["TBQ", "BTQ", "BQT"], figures: ["BTQ"] },
      },
      {
        math: [m`\angle RCQ=180^\circ-\angle CRQ-\angle CQR`],
        reason: "(∠ sum of △)",
        highlights: { angles: ["RCQ", "CRQ", "CQR"], figures: ["CRQ"] },
      },
      {
        math: [m`\therefore\ \angle TBQ=\angle RCQ`],
        highlights: { angles: ["TBQ", "RCQ"] },
      },
      {
        math: [m`\therefore\ \triangle BTQ\sim\triangle CRQ`],
        reason: "(AAA)",
        highlights: { figures: ["BTQ", "CRQ"] },
        conclusion: true,
      },
      {
        math: [
          m`\therefore\ \frac{QT}{QR}=\frac{BT}{CR}`,
          m`\frac{QT}{2\text{ m}}=\frac{8\text{ m}}{1.6\text{ m}}`,
          m`QT=2\times5\text{ m}`,
          m`=10\text{ m}`,
        ],
        reason: "(corr. sides, ~△s)",
        highlights: { sides: ["QT", "QR", "BT", "CR"] },
      },
      {
        heading: "(c) Distance between the two lamps",
        math: [m`=PS+QT-QS`, m`=(13.125+10-5)\text{ m}`, m`=18.125\text{ m}`],
        highlights: { sides: ["PS", "QT", "QS", "PT"] },
      },
    ],
  },
  "rev8-36": {
    pages: [21],
    initialVisible: 1,
    steps: [
      {
        math: [m`\because\ ABCDE\sim PQRST`],
        highlights: { figures: ["ABCDE", "PQRST"] },
      },
      {
        math: [
          m`\therefore\ \frac{AB}{PQ}=\frac{BE}{QT}`,
          m`\frac{x}{6}=\frac{x+2}{9}`,
          m`9x=6x+12`,
          m`3x=12`,
          m`x=4`,
        ],
        highlights: { sides: ["AB", "PQ", "BE", "QT"] },
      },
      {
        math: [m`\frac{RS}{CD}=\frac{PQ}{AB}`, m`\frac{y}{8}=\frac64`, m`y=12`],
        highlights: { sides: ["RS", "CD", "PQ", "AB"] },
      },
    ],
  },
  "rev8-37": {
    pages: [21],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [
          m`\angle DEA+\angle EAB=180^\circ`,
          m`\angle DEA+60^\circ=180^\circ`,
          m`\angle DEA=120^\circ`,
        ],
        reason: "(int. ∠s, AB // ED)",
        highlights: { angles: ["DEA", "EAB"], sides: ["AB", "ED"] },
      },
      {
        math: [m`\text{i.e.}\quad\angle DEP=120^\circ`],
        highlights: { angles: ["DEP"] },
      },
      {
        math: [m`\because\ ABCDE\sim DEPQR`],
        highlights: { figures: ["ABCDE", "DEPQR"] },
      },
      {
        math: [m`\therefore\ \angle ABC=\angle DEP`, m`=120^\circ`],
        highlights: { angles: ["ABC", "DEP"] },
      },
      {
        heading: "(b)",
        math: [m`\because\ ABCDE\sim DEPQR`],
        highlights: { figures: ["ABCDE", "DEPQR"] },
      },
      {
        math: [m`\therefore\ \angle RDE=\angle EAB`, m`=60^\circ`],
        highlights: { angles: ["RDE", "EAB"] },
      },
      {
        math: [
          m`\because\ \angle DEA+\angle RDE=120^\circ+60^\circ`,
          m`=180^\circ`,
        ],
        highlights: { angles: ["DEA", "RDE"] },
      },
      {
        math: [m`\therefore\ AE\mathbin{//}RD`],
        reason: "(int. ∠s supp.)",
        highlights: { sides: ["AE", "RD"], angles: ["DEA", "RDE"] },
      },
      {
        math: [
          m`\because\ \angle EAB+\angle ABC=60^\circ+120^\circ`,
          m`=180^\circ`,
        ],
        highlights: { angles: ["EAB", "ABC"] },
      },
      {
        math: [m`\therefore\ AE\mathbin{//}BC`],
        reason: "(int. ∠s supp.)",
        highlights: { sides: ["AE", "BC"], angles: ["EAB", "ABC"] },
      },
      {
        math: [m`\therefore\ AE\mathbin{//}RD\mathbin{//}BC`],
        highlights: { sides: ["AE", "RD", "BC"] },
      },
    ],
  },
  "rev8-38": {
    pages: [22],
    initialVisible: 1,
    steps: [
      {
        heading: "(a)",
        math: [m`AE=AD-ED`, m`=(20-8)\text{ cm}`, m`=12\text{ cm}`],
        highlights: { sides: ["AE", "AD", "ED"] },
      },
      {
        text: "∵ CDEF and AEGH are two similar rectangles.",
        highlights: { figures: ["CDEF", "AEGH"] },
      },
      {
        math: [m`\therefore\ AEGH\sim DCFE`],
        highlights: { figures: ["AEGH", "DCFE"] },
        conclusion: true,
      },
      {
        math: [
          m`\therefore\ \frac{AH}{DE}=\frac{AE}{DC}`,
          m`\frac{AH}{8\text{ cm}}=\frac{12\text{ cm}}{10\text{ cm}}`,
          m`AH=\frac{12}{10}\times8\text{ cm}`,
          m`=9.6\text{ cm}`,
        ],
        highlights: { sides: ["AH", "DE", "AE", "DC"] },
      },
      {
        heading: "(b)",
        math: [m`HB=AB-AH`, m`=(10-9.6)\text{ cm}`, m`=0.4\text{ cm}`],
        highlights: { sides: ["HB", "AB", "AH"] },
      },
      {
        math: [
          m`\text{The required percentage}=\frac{12\times0.4}{20\times10}\times100\%`,
          m`=2.4\%`,
        ],
        highlights: {
          figures: ["BFGH", "ABCD"],
          sides: ["AE", "HB", "AD", "AB"],
        },
      },
    ],
  },
};
