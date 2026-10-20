import type { CongruenceQuestion } from "./types";
import type { Point } from "../similarity/types";
import type { TextbookStep } from "../similarity/textbook-types";

const tex = String.raw;
const point = (label: string, x: number, y: number): Point => ({ label, x, y });
const triangles = (...names: string[]) =>
  names.map((name) => ({ name: `△${name}`, vertices: [...name] }));
const line = (
  math: string,
  highlights: TextbookStep["highlights"],
  reason?: string,
  extra: Pick<TextbookStep, "heading" | "conclusion"> = {},
): TextbookStep => ({
  math: [math],
  highlights,
  ...(reason ? { reason } : {}),
  ...extra,
});
const intro = (heading: string, ...figures: string[]): TextbookStep => ({
  heading,
  highlights: { figures },
});
const sidesReason = "corr. sides, ≅△s";
const anglesReason = "corr. ∠s, ≅△s";
const angleSum = "∠ sum of △";

/** These three source questions have no printed figure. Construct equal
 * triangles from the givens, keeping the second triangle a rigid translation.
 * Coordinates remain page pixels, but the display fits these points separately.
 */
function constructedPair(
  names: [string, string],
  sides: [number, number, number],
): Point[] {
  const [ab, bc, ca] = sides;
  const x = (ab * ab + ca * ca - bc * bc) / (2 * ab);
  const y = Math.sqrt(ca * ca - x * x);
  const scale = 230 / Math.max(ab, bc, ca);
  return names.flatMap((name, i) =>
    [
      [0, 0],
      [ab, 0],
      [x, -y],
    ].map(([px, py], j) =>
      point(name[j], 250 + i * 380 + px * scale, 650 + py * scale),
    ),
  );
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;
const a20AngleZ = Math.asin((7.5 * Math.sin(radians(52))) / 8.4);
const a20AngleX = Math.PI - radians(52) - a20AngleZ;
const a20YZ = (8.4 * Math.sin(a20AngleX)) / Math.sin(radians(52));

// Visually transcribed from textbook pp. 5.11, 5.12, 5.29 and 5.30 and
// Full Solutions PDF pages 6–9. One printed mathematical line per step;
// blank reason cells remain blank. Geometry is traced at 1225 × 1617 pixels.
export const exerciseABQuestions: CongruenceQuestion[] = [
  {
    id: "ex5a-15",
    group: "Exercise 5A",
    number: "15",
    page: 11,
    crop: [140, 987, 450, 1165],
    points: [
      point("A", 222, 1136),
      point("B", 389, 1136),
      point("C", 422, 1007),
      point("D", 255, 1007),
      point("E", 322, 1072),
    ],
    shapes: triangles("ABE", "CDE"),
    prompt: "Write down the pair of congruent triangles using the symbol ≅.",
    solutionPages: [6],
    steps: [
      line(
        tex`\triangle ABE\cong\triangle CDE`,
        { figures: ["ABE", "CDE"] },
        undefined,
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5a-16",
    group: "Exercise 5A",
    number: "16",
    page: 11,
    crop: [470, 988, 782, 1170],
    points: [
      point("A", 531, 1082),
      point("B", 690, 1147),
      point("C", 747, 1082),
      point("D", 690, 1018),
    ],
    shapes: triangles("ABC", "ADC"),
    prompt: "Write down the pair of congruent triangles using the symbol ≅.",
    solutionPages: [6],
    steps: [
      line(
        tex`\triangle ABC\cong\triangle ADC`,
        { figures: ["ABC", "ADC"] },
        undefined,
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5a-17",
    group: "Exercise 5A",
    number: "17",
    page: 11,
    crop: [800, 989, 1093, 1166],
    points: [
      point("A", 879, 1017),
      point("B", 879, 1137),
      point("C", 1049, 1137),
      point("D", 1049, 1017),
    ],
    shapes: triangles("ABC", "CDA"),
    prompt: "Write down the pair of congruent triangles using the symbol ≅.",
    rightAngles: ["ABC", "CDA"],
    solutionPages: [6],
    steps: [
      line(
        tex`\triangle ABC\cong\triangle CDA`,
        { figures: ["ABC", "CDA"] },
        undefined,
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5a-18",
    group: "Exercise 5A",
    number: "18",
    page: 11,
    crop: [140, 1202, 1145, 1317],
    constructed: true,
    points: constructedPair(["XYZ", "PRQ"], [7, 9, 10]),
    shapes: triangles("XYZ", "PRQ"),
    prompt:
      "Given △XYZ ≅ △PRQ, XY = 7 cm, YZ = 9 cm and XZ = 10 cm. Find (a) PQ and (b) PR.",
    solutionPages: [6],
    steps: [
      line(
        tex`\because\triangle XYZ\cong\triangle PRQ`,
        { figures: ["XYZ", "PRQ"] },
        undefined,
        { heading: "(a)" },
      ),
      line(tex`\therefore PQ=XZ`, { sides: ["PQ", "XZ"] }, sidesReason),
      line(tex`=10\text{ cm}`, { sides: ["PQ", "XZ"] }),
      line(
        tex`\because\triangle XYZ\cong\triangle PRQ`,
        { figures: ["XYZ", "PRQ"] },
        undefined,
        { heading: "(b)" },
      ),
      line(tex`\therefore PR=XY`, { sides: ["PR", "XY"] }, sidesReason),
      line(tex`=7\text{ cm}`, { sides: ["PR", "XY"] }),
    ],
  },
  {
    id: "ex5a-19",
    group: "Exercise 5A",
    number: "19",
    page: 11,
    crop: [140, 1332, 1145, 1447],
    constructed: true,
    points: constructedPair(
      ["XYZ", "SRT"],
      [Math.sin(radians(30)), Math.sin(radians(85)), Math.sin(radians(65))],
    ),
    shapes: triangles("XYZ", "SRT"),
    prompt: "Given △XYZ ≅ △SRT, ∠X = 85° and ∠Y = 65°. Find (a) ∠R and (b) ∠T.",
    solutionPages: [6],
    steps: [
      line(
        tex`\because\triangle XYZ\cong\triangle SRT`,
        { figures: ["XYZ", "SRT"] },
        undefined,
        { heading: "(a)" },
      ),
      line(
        tex`\therefore\angle R=\angle Y`,
        { angles: ["SRT", "XYZ"] },
        anglesReason,
      ),
      line(tex`=65^\circ`, { angles: ["SRT", "XYZ"] }),
      intro("(b) In △XYZ,", "XYZ"),
      line(
        tex`85^\circ+65^\circ+\angle Z=180^\circ`,
        { angles: ["YXZ", "XYZ", "XZY"] },
        angleSum,
      ),
      line(tex`\angle Z=30^\circ`, { angles: ["XZY"] }),
      line(tex`\because\triangle XYZ\cong\triangle SRT`, {
        figures: ["XYZ", "SRT"],
      }),
      line(
        tex`\therefore\angle T=\angle Z`,
        { angles: ["STR", "XZY"] },
        anglesReason,
      ),
      line(tex`=30^\circ`, { angles: ["STR", "XZY"] }),
    ],
  },
  {
    id: "ex5a-20",
    group: "Exercise 5A",
    number: "20",
    page: 11,
    crop: [140, 1458, 1145, 1566],
    constructed: true,
    points: constructedPair(["XYZ", "CDE"], [7.5, a20YZ, 8.4]),
    shapes: triangles("XYZ", "CDE"),
    prompt:
      "Given △XYZ ≅ △CDE, ∠Y = 52°, XY = 7.5 cm and XZ = 8.4 cm. Find (a) ∠D and (b) CE.",
    solutionPages: [6],
    steps: [
      line(
        tex`\because\triangle XYZ\cong\triangle CDE`,
        { figures: ["XYZ", "CDE"] },
        undefined,
        { heading: "(a)" },
      ),
      line(
        tex`\therefore\angle D=\angle Y`,
        { angles: ["CDE", "XYZ"] },
        anglesReason,
      ),
      line(tex`=52^\circ`, { angles: ["CDE", "XYZ"] }),
      line(
        tex`\because\triangle XYZ\cong\triangle CDE`,
        { figures: ["XYZ", "CDE"] },
        undefined,
        { heading: "(b)" },
      ),
      line(tex`\therefore CE=XZ`, { sides: ["CE", "XZ"] }, sidesReason),
      line(tex`=8.4\text{ cm}`, { sides: ["CE", "XZ"] }),
    ],
  },
  {
    id: "ex5a-21",
    group: "Exercise 5A",
    number: "21",
    page: 12,
    crop: [84, 158, 497, 438],
    points: [
      point("A", 438, 221),
      point("B", 438, 307),
      point("C", 301, 307),
      point("D", 165, 307),
      point("E", 165, 392),
    ],
    shapes: triangles("ABC", "EDC"),
    prompt:
      "Given △ABC ≅ △EDC, AB = 5, BC = 8 and ∠DEC = 58°. Find x, y and z.",
    rightAngles: ["EDC"],
    solutionPages: [6],
    steps: [
      line(tex`\because\triangle ABC\cong\triangle EDC`, {
        figures: ["ABC", "EDC"],
      }),
      line(tex`\therefore ED=AB`, { sides: ["ED", "AB"] }, sidesReason),
      line(tex`x=5`, { sides: ["ED", "AB"] }),
      line(
        tex`\angle BAC=\angle DEC`,
        { angles: ["BAC", "DEC"] },
        anglesReason,
      ),
      line(tex`y=58^\circ`, { angles: ["BAC", "DEC"] }),
      line(
        tex`\angle ABC=\angle EDC`,
        { angles: ["ABC", "EDC"] },
        anglesReason,
      ),
      line(tex`z=90^\circ`, { angles: ["ABC", "EDC"] }),
    ],
  },
  {
    id: "ex5a-22",
    group: "Exercise 5A",
    number: "22",
    page: 12,
    crop: [558, 158, 864, 463],
    points: [
      point("A", 712, 224),
      point("B", 642, 374),
      point("C", 712, 444),
      point("D", 782, 374),
    ],
    shapes: triangles("ABC", "ADC"),
    prompt:
      "Given △ABC ≅ △ADC, AB = 10, BC = 6, ∠DAC = 25° and ∠ACD = 45°. Find x and y.",
    solutionPages: [6],
    steps: [
      intro("In △ADC,", "ADC"),
      line(
        tex`25^\circ+\angle ADC+45^\circ=180^\circ`,
        { angles: ["DAC", "ADC", "ACD"] },
        angleSum,
      ),
      line(tex`\angle ADC=110^\circ`, { angles: ["ADC"] }),
      line(tex`\because\triangle ABC\cong\triangle ADC`, {
        figures: ["ABC", "ADC"],
      }),
      line(
        tex`\therefore\angle ABC=\angle ADC`,
        { angles: ["ABC", "ADC"] },
        anglesReason,
      ),
      line(tex`x=110^\circ`, { angles: ["ABC", "ADC"] }),
      line(tex`AD=AB`, { sides: ["AD", "AB"] }, sidesReason),
      line(tex`y=10`, { sides: ["AD", "AB"] }),
    ],
  },
  {
    id: "ex5a-23",
    group: "Exercise 5A",
    number: "23",
    page: 12,
    crop: [84, 503, 1111, 715],
    points: [
      point("A", 956, 532),
      point("B", 875, 684),
      point("C", 956, 684),
      point("D", 1037, 684),
    ],
    shapes: triangles("ABC", "ADC"),
    prompt:
      "BCD is a straight line and △ABC ≅ △ADC. Given BC = 4 cm, ∠ADC = 62° and ∠ACD = 90°, find (a) ∠BAC and (b) BD.",
    rightAngles: ["ACD"],
    solutionPages: [6],
    steps: [
      intro("(a) In △ADC,", "ADC"),
      line(
        tex`\angle DAC+62^\circ+90^\circ=180^\circ`,
        { angles: ["DAC", "ADC", "ACD"] },
        angleSum,
      ),
      line(tex`\angle DAC=28^\circ`, { angles: ["DAC"] }),
      line(tex`\because\triangle ABC\cong\triangle ADC`, {
        figures: ["ABC", "ADC"],
      }),
      line(
        tex`\therefore\angle BAC=\angle DAC`,
        { angles: ["BAC", "DAC"] },
        anglesReason,
      ),
      line(tex`=28^\circ`, { angles: ["BAC", "DAC"] }),
      line(
        tex`\because\triangle ABC\cong\triangle ADC`,
        { figures: ["ABC", "ADC"] },
        undefined,
        { heading: "(b)" },
      ),
      line(tex`\therefore CD=CB`, { sides: ["CD", "CB"] }, sidesReason),
      line(tex`=4\text{ cm}`, { sides: ["CD", "CB"] }),
      line(tex`BD=BC+CD`, { sides: ["BD", "BC", "CD"] }),
      line(tex`=(4+4)\text{ cm}`, { sides: ["BD", "BC", "CD"] }),
      line(tex`=8\text{ cm}`, { sides: ["BD"] }),
    ],
  },
  {
    id: "ex5a-24",
    group: "Exercise 5A",
    number: "24",
    page: 12,
    crop: [84, 730, 1111, 909],
    points: [
      point("A", 862, 878),
      point("B", 983, 878),
      point("C", 1048, 878),
      point("D", 983, 757),
      point("E", 983, 814),
    ],
    shapes: triangles("ABE", "DBC"),
    prompt:
      "ABC and BED are straight lines and △ABE ≅ △DBC. Given AB = 15 cm, BC = 8 cm and AE = 17 cm, find (a) BD and (b) DE.",
    solutionPages: [6],
    steps: [
      line(
        tex`\because\triangle ABE\cong\triangle DBC`,
        { figures: ["ABE", "DBC"] },
        undefined,
        { heading: "(a)" },
      ),
      line(tex`\therefore BD=BA`, { sides: ["BD", "BA"] }, sidesReason),
      line(tex`=15\text{ cm}`, { sides: ["BD", "BA"] }),
      line(
        tex`\because\triangle ABE\cong\triangle DBC`,
        { figures: ["ABE", "DBC"] },
        undefined,
        { heading: "(b)" },
      ),
      line(tex`\therefore BE=BC`, { sides: ["BE", "BC"] }, sidesReason),
      line(tex`=8\text{ cm}`, { sides: ["BE", "BC"] }),
      line(tex`DE=BD-BE`, { sides: ["DE", "BD", "BE"] }),
      line(tex`=(15-8)\text{ cm}`, { sides: ["DE", "BD", "BE"] }),
      line(tex`=7\text{ cm}`, { sides: ["DE"] }),
    ],
  },
  {
    id: "ex5a-25",
    group: "Exercise 5A",
    number: "25",
    page: 12,
    crop: [84, 923, 1111, 1104],
    points: [
      point("A", 873, 1072),
      point("B", 950, 1027),
      point("C", 1028, 1078),
      point("D", 1071, 958),
      point("E", 840, 950),
    ],
    shapes: triangles("ABE", "CBD"),
    prompt:
      "ABD and CBE are straight lines and △ABE ≅ △CBD. Given ∠AEB = 41° and ∠BCD = 75°, find ∠DBE.",
    solutionPages: [6],
    steps: [
      line(tex`\because\triangle ABE\cong\triangle CBD`, {
        figures: ["ABE", "CBD"],
      }),
      line(
        tex`\therefore\angle EAB=\angle DCB`,
        { angles: ["EAB", "DCB"] },
        anglesReason,
      ),
      line(tex`=75^\circ`, { angles: ["EAB", "DCB"] }),
      intro("In △ABE,", "ABE"),
      line(
        tex`\angle DBE=41^\circ+\angle EAB`,
        { angles: ["DBE", "AEB", "EAB"] },
        "ext. ∠ of △",
      ),
      line(tex`=41^\circ+75^\circ`, { angles: ["DBE", "AEB", "EAB"] }),
      line(tex`=116^\circ`, { angles: ["DBE"] }),
    ],
  },
  {
    id: "ex5a-26",
    group: "Exercise 5A",
    number: "26",
    page: 12,
    crop: [84, 1121, 1111, 1305],
    points: [
      point("A", 846, 1152),
      point("B", 736, 1280),
      point("C", 1067, 1280),
      point("D", 958, 1152),
      point("E", 902, 1185),
    ],
    shapes: triangles("ABC", "DCB"),
    prompt:
      "AEC and DEB are straight lines and △ABC ≅ △DCB. Given ∠BAC = 100° and ∠BCA = 30°, find (a) ∠CBD and (b) ∠ABE.",
    solutionPages: [6, 7],
    steps: [
      line(
        tex`\because\triangle ABC\cong\triangle DCB`,
        { figures: ["ABC", "DCB"] },
        undefined,
        { heading: "(a)" },
      ),
      line(
        tex`\therefore\angle CBD=\angle BCA`,
        { angles: ["CBD", "BCA"] },
        anglesReason,
      ),
      line(tex`=30^\circ`, { angles: ["CBD", "BCA"] }),
      intro("(b) In △ABC,", "ABC"),
      line(
        tex`(\angle ABE+\angle CBD)+100^\circ+30^\circ=180^\circ`,
        { angles: ["ABE", "CBD", "BAC", "BCA"] },
        angleSum,
      ),
      line(tex`(\angle ABE+30^\circ)+100^\circ+30^\circ=180^\circ`, {
        angles: ["ABE", "CBD", "BAC", "BCA"],
      }),
      line(tex`\angle ABE=20^\circ`, { angles: ["ABE"] }),
    ],
  },
  {
    id: "ex5a-27",
    group: "Exercise 5A",
    number: "27",
    page: 12,
    crop: [84, 1310, 1115, 1564],
    points: [
      point("A", 1014, 1348),
      point("B", 1014, 1422),
      point("C", 1014, 1534),
      point("D", 903, 1534),
      point("E", 828, 1534),
    ],
    shapes: triangles("ADC", "EBC"),
    prompt:
      "ABC and CDE are straight lines and △ADC ≅ △EBC. Given AC = 5 cm, ED = 2 cm, ∠DAC = 31° and ∠ACD = 90°, find x and y.",
    rightAngles: ["ACD", "BCE"],
    solutionPages: [7],
    steps: [
      line(tex`\because\triangle ADC\cong\triangle EBC`, {
        figures: ["ADC", "EBC"],
      }),
      line(tex`\therefore EC=AC`, { sides: ["EC", "AC"] }, sidesReason),
      line(tex`2+x=5`, { sides: ["ED", "DC", "AC"] }),
      line(tex`x=3`, { sides: ["DC"] }),
      line(
        tex`\angle BEC=\angle DAC`,
        { angles: ["BEC", "DAC"] },
        anglesReason,
      ),
      line(tex`=31^\circ`, { angles: ["BEC", "DAC"] }),
      intro("In △BEC,", "BEC"),
      line(
        tex`y+\angle BEC+90^\circ=180^\circ`,
        { angles: ["EBC", "BEC", "BCE"] },
        angleSum,
      ),
      line(tex`y+31^\circ+90^\circ=180^\circ`, {
        angles: ["EBC", "BEC", "BCE"],
      }),
      line(tex`y=59^\circ`, { angles: ["EBC"] }),
    ],
  },
  {
    id: "ex5b-19",
    group: "Exercise 5B",
    number: "19",
    page: 29,
    crop: [140, 167, 1150, 320],
    points: [
      point("A", 921, 204),
      point("B", 1090, 204),
      point("C", 1123, 289),
      point("D", 952, 289),
    ],
    shapes: triangles("ABC", "CDA"),
    prompt: "AB = CD = 3 cm and ∠BAC = ∠DCA = 23°. Prove that △ABC ≅ △CDA.",
    solutionPages: [8],
    steps: [
      intro("In △ABC and △CDA,", "ABC", "CDA"),
      line(tex`AB=CD`, { sides: ["AB", "CD"] }, "given"),
      line(tex`\angle BAC=\angle DCA`, { angles: ["BAC", "DCA"] }, "given"),
      line(tex`AC=CA`, { sides: ["AC", "CA"] }, "common side"),
      line(
        tex`\therefore\triangle ABC\cong\triangle CDA`,
        { figures: ["ABC", "CDA"] },
        "SAS",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-20",
    group: "Exercise 5B",
    number: "20",
    page: 29,
    crop: [140, 332, 1150, 490],
    points: [
      point("A", 951, 465),
      point("B", 1123, 465),
      point("C", 1037, 362),
      point("D", 1037, 465),
    ],
    shapes: triangles("CDA", "CDB"),
    prompt:
      "ADB is a straight line, CA = CB and CD ⟂ AB. Prove that △CDA ≅ △CDB.",
    rightAngles: ["CDA", "CDB"],
    solutionPages: [8],
    steps: [
      intro("In △CDA and △CDB,", "CDA", "CDB"),
      line(tex`\angle CDA=90^\circ`, { angles: ["CDA"] }, "given"),
      line(
        tex`\therefore90^\circ+\angle CDB=180^\circ`,
        { angles: ["CDA", "CDB"] },
        "adj. ∠s on st. line",
      ),
      line(tex`\angle CDB=90^\circ`, { angles: ["CDB"] }),
      line(tex`\therefore\angle CDA=\angle CDB=90^\circ`, {
        angles: ["CDA", "CDB"],
      }),
      line(tex`CA=CB`, { sides: ["CA", "CB"] }, "given"),
      line(tex`CD=CD`, { sides: ["CD"] }, "common side"),
      line(
        tex`\therefore\triangle CDA\cong\triangle CDB`,
        { figures: ["CDA", "CDB"] },
        "RHS",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-21",
    group: "Exercise 5B",
    number: "21",
    page: 29,
    crop: [140, 499, 1150, 636],
    points: [
      point("A", 892, 530),
      point("B", 1007, 530),
      point("C", 1121, 609),
      point("D", 1007, 609),
    ],
    shapes: triangles("ABD", "CDB"),
    prompt: "∠BAD = ∠DCB and ∠ABD = ∠CDB = 90°. Prove that △ABD ≅ △CDB.",
    rightAngles: ["ABD", "CDB"],
    solutionPages: [8],
    steps: [
      intro("In △ABD and △CDB,", "ABD", "CDB"),
      line(tex`\angle BAD=\angle DCB`, { angles: ["BAD", "DCB"] }, "given"),
      line(tex`\angle ABD=\angle CDB`, { angles: ["ABD", "CDB"] }, "given"),
      line(tex`BD=DB`, { sides: ["BD", "DB"] }, "common side"),
      line(
        tex`\therefore\triangle ABD\cong\triangle CDB`,
        { figures: ["ABD", "CDB"] },
        "AAS",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-22",
    group: "Exercise 5B",
    number: "22",
    page: 29,
    crop: [140, 645, 1150, 819],
    points: [
      point("D", 862, 723),
      point("E", 752, 786),
      point("F", 950, 786),
      point("M", 1014, 786),
      point("L", 960, 671),
      point("N", 1123, 786),
    ],
    shapes: triangles("DEF", "MLN"),
    prompt:
      "In △DEF, ∠D = 115°, ∠E = 30° and EF = 6 cm. In △MLN, ∠M = 115°, ∠N = 35° and LN = 6 cm. Prove that △DEF ≅ △MLN.",
    solutionPages: [8],
    steps: [
      intro("In △DEF,", "DEF"),
      line(
        tex`\angle F+115^\circ+30^\circ=180^\circ`,
        { angles: ["DFE", "EDF", "DEF"] },
        angleSum,
      ),
      line(tex`\angle F=35^\circ`, { angles: ["DFE"] }),
      intro("In △DEF and △MLN,", "DEF", "MLN"),
      line(tex`\angle F=\angle N`, { angles: ["DFE", "MNL"] }),
      line(tex`\angle D=\angle M`, { angles: ["EDF", "LMN"] }, "given"),
      line(tex`EF=LN`, { sides: ["EF", "LN"] }, "given"),
      line(
        tex`\therefore\triangle DEF\cong\triangle MLN`,
        { figures: ["DEF", "MLN"] },
        "AAS",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-23",
    group: "Exercise 5B",
    number: "23",
    page: 29,
    crop: [140, 830, 1150, 1015],
    points: [
      point("E", 1125, 857),
      point("F", 1001, 893),
      point("G", 1028, 986),
      point("H", 1125, 986),
    ],
    shapes: triangles("EFG", "EHG"),
    prompt:
      "∠EFG = ∠EHG = 90°, ∠FEG = 37° and ∠EGH = 53°. Prove that △EFG ≅ △EHG.",
    rightAngles: ["EFG", "EHG"],
    solutionPages: [8],
    steps: [
      intro("In △EFG,", "EFG"),
      line(
        tex`\angle FGE+90^\circ+37^\circ=180^\circ`,
        { angles: ["FGE", "EFG", "FEG"] },
        angleSum,
      ),
      line(tex`\angle FGE=53^\circ`, { angles: ["FGE"] }),
      intro("In △EFG and △EHG,", "EFG", "EHG"),
      line(tex`\angle FGE=\angle HGE`, { angles: ["FGE", "HGE"] }),
      line(tex`\angle EFG=\angle EHG`, { angles: ["EFG", "EHG"] }, "given"),
      line(tex`EG=EG`, { sides: ["EG"] }, "common side"),
      line(
        tex`\therefore\triangle EFG\cong\triangle EHG`,
        { figures: ["EFG", "EHG"] },
        "AAS",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-24",
    group: "Exercise 5B",
    number: "24",
    page: 29,
    crop: [140, 1028, 1150, 1210],
    points: [
      point("A", 956, 1056),
      point("B", 992, 1183),
      point("C", 1058, 1183),
      point("D", 1124, 1183),
      point("E", 974, 1120),
      point("F", 1024, 1141),
    ],
    shapes: triangles("ABC", "DBE"),
    prompt:
      "AEB, BCD, AFC and EFD are straight lines. AE = EB = BC = CD = 4 cm. Prove that △ABC ≅ △DBE.",
    solutionPages: [8],
    steps: [
      line(tex`AB=(4+4)\text{ cm}=8\text{ cm}`, { sides: ["AB", "AE", "EB"] }),
      line(tex`DB=(4+4)\text{ cm}=8\text{ cm}`, { sides: ["DB", "DC", "CB"] }),
      intro("In △ABC and △DBE,", "ABC", "DBE"),
      line(tex`AB=DB`, { sides: ["AB", "DB"] }),
      line(tex`\angle ABC=\angle DBE`, { angles: ["ABC", "DBE"] }, "common ∠"),
      line(tex`BC=BE`, { sides: ["BC", "BE"] }, "given"),
      line(
        tex`\therefore\triangle ABC\cong\triangle DBE`,
        { figures: ["ABC", "DBE"] },
        "SAS",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-25",
    group: "Exercise 5B",
    number: "25",
    page: 29,
    crop: [140, 1227, 1150, 1416],
    points: [
      point("A", 985, 1255),
      point("B", 897, 1381),
      point("C", 951, 1381),
      point("D", 1068, 1381),
      point("E", 1123, 1381),
      point("F", 1040, 1255),
    ],
    shapes: triangles("ABD", "FEC"),
    prompt:
      "BCDE is a straight line. ∠ADB = ∠FCE, ∠ABD = ∠FEC, BC = DE = 3 cm and CD = 5 cm. Prove that △ABD ≅ △FEC.",
    solutionPages: [8],
    steps: [
      line(tex`BD=(3+5)\text{ cm}=8\text{ cm}`, { sides: ["BD", "BC", "CD"] }),
      line(tex`EC=(5+3)\text{ cm}=8\text{ cm}`, { sides: ["EC", "CD", "DE"] }),
      intro("In △ABD and △FEC,", "ABD", "FEC"),
      line(tex`\angle ADB=\angle FCE`, { angles: ["ADB", "FCE"] }, "given"),
      line(tex`BD=EC`, { sides: ["BD", "EC"] }),
      line(tex`\angle ABD=\angle FEC`, { angles: ["ABD", "FEC"] }, "given"),
      line(
        tex`\therefore\triangle ABD\cong\triangle FEC`,
        { figures: ["ABD", "FEC"] },
        "ASA",
        { conclusion: true },
      ),
    ],
  },
  {
    id: "ex5b-26",
    group: "Exercise 5B",
    number: "26",
    page: 30,
    crop: [83, 106, 1111, 338],
    points: [
      point("A", 1025, 133),
      point("B", 1068, 222),
      point("C", 1025, 312),
      point("D", 898, 222),
    ],
    shapes: triangles("ABD", "CBD"),
    prompt:
      "AB = BC and AD = CD. (a) Prove that △ABD ≅ △CBD. (b) Given ∠ADB = 35° and ∠BCD = 81°, find a and b.",
    solutionPages: [8],
    steps: [
      intro("(a) In △ABD and △CBD,", "ABD", "CBD"),
      line(tex`AB=CB`, { sides: ["AB", "CB"] }, "given"),
      line(tex`AD=CD`, { sides: ["AD", "CD"] }, "given"),
      line(tex`BD=BD`, { sides: ["BD"] }, "common side"),
      line(
        tex`\therefore\triangle ABD\cong\triangle CBD`,
        { figures: ["ABD", "CBD"] },
        "SSS",
        { conclusion: true },
      ),
      line(
        tex`\because\triangle ABD\cong\triangle CBD`,
        { figures: ["ABD", "CBD"] },
        undefined,
        { heading: "(b)" },
      ),
      line(
        tex`\therefore\angle BDC=\angle BDA`,
        { angles: ["BDC", "BDA"] },
        anglesReason,
      ),
      line(tex`a=35^\circ`, { angles: ["BDC"] }),
      intro("In △CBD,", "CBD"),
      line(
        tex`81^\circ+a+\angle CBD=180^\circ`,
        { angles: ["BCD", "BDC", "CBD"] },
        angleSum,
      ),
      line(tex`81^\circ+35^\circ+\angle CBD=180^\circ`, {
        angles: ["BCD", "BDC", "CBD"],
      }),
      line(tex`\angle CBD=64^\circ`, { angles: ["CBD"] }),
      line(
        tex`\angle ABD=\angle CBD`,
        { angles: ["ABD", "CBD"] },
        anglesReason,
      ),
      line(tex`b=64^\circ`, { angles: ["ABD"] }),
    ],
  },
  {
    id: "ex5b-27",
    group: "Exercise 5B",
    number: "27",
    page: 30,
    crop: [83, 358, 1111, 497],
    points: [
      point("P", 850, 389),
      point("Q", 886, 469),
      point("R", 1039, 469),
      point("S", 1077, 389),
    ],
    shapes: triangles("PQR", "SRQ"),
    prompt:
      "PR = QS and ∠PRQ = ∠SQR = 23°. (a) Prove that △PQR ≅ △SRQ. (b) Given ∠RSQ = 42°, find ∠PQS.",
    solutionPages: [8, 9],
    steps: [
      intro("(a) In △PQR and △SRQ,", "PQR", "SRQ"),
      line(tex`PR=SQ`, { sides: ["PR", "SQ"] }, "given"),
      line(tex`\angle PRQ=\angle SQR`, { angles: ["PRQ", "SQR"] }, "given"),
      line(tex`QR=RQ`, { sides: ["QR", "RQ"] }, "common side"),
      line(
        tex`\therefore\triangle PQR\cong\triangle SRQ`,
        { figures: ["PQR", "SRQ"] },
        "SAS",
        { conclusion: true },
      ),
      line(
        tex`\because\triangle PQR\cong\triangle SRQ`,
        { figures: ["PQR", "SRQ"] },
        undefined,
        { heading: "(b)" },
      ),
      line(
        tex`\therefore\angle QPR=\angle RSQ`,
        { angles: ["QPR", "RSQ"] },
        anglesReason,
      ),
      line(tex`=42^\circ`, { angles: ["QPR", "RSQ"] }),
      intro("In △PQR,", "PQR"),
      line(
        tex`23^\circ+\angle QPR+(23^\circ+\angle PQS)=180^\circ`,
        { angles: ["PRQ", "QPR", "SQR", "PQS"] },
        angleSum,
      ),
      line(tex`23^\circ+42^\circ+(23^\circ+\angle PQS)=180^\circ`, {
        angles: ["PRQ", "QPR", "SQR", "PQS"],
      }),
      line(tex`\angle PQS=92^\circ`, { angles: ["PQS"] }),
    ],
  },
  {
    id: "ex5b-28",
    group: "Exercise 5B",
    number: "28",
    page: 30,
    crop: [64, 509, 1111, 739],
    points: [
      point("A", 983, 539),
      point("B", 908, 679),
      point("C", 891, 713),
      point("D", 977, 696),
      point("E", 1066, 718),
      point("F", 1050, 684),
    ],
    shapes: triangles("AFC", "ABE"),
    prompt:
      "ABC, AFE, BDE and CDF are straight lines. AC = AE and ∠ACF = ∠AEB. (a) Prove that △AFC ≅ △ABE. (b) Are BC and EF equal? Explain.",
    solutionPages: [9],
    steps: [
      intro("(a) In △AFC and △ABE,", "AFC", "ABE"),
      line(tex`\angle CAF=\angle EAB`, { angles: ["CAF", "EAB"] }, "common ∠"),
      line(tex`AC=AE`, { sides: ["AC", "AE"] }, "given"),
      line(tex`\angle ACF=\angle AEB`, { angles: ["ACF", "AEB"] }, "given"),
      line(
        tex`\therefore\triangle AFC\cong\triangle ABE`,
        { figures: ["AFC", "ABE"] },
        "ASA",
        { conclusion: true },
      ),
      line(
        tex`\because\triangle AFC\cong\triangle ABE`,
        { figures: ["AFC", "ABE"] },
        undefined,
        { heading: "(b)" },
      ),
      line(tex`\therefore AF=AB`, { sides: ["AF", "AB"] }, sidesReason),
      line(tex`\because AC=AE`, { sides: ["AC", "AE"] }, "given"),
      line(tex`\therefore AC-AB=AE-AF`, { sides: ["AC", "AB", "AE", "AF"] }),
      line(tex`\therefore BC=EF`, { sides: ["BC", "EF"] }),
    ],
  },
  {
    id: "ex5b-29",
    group: "Exercise 5B",
    number: "29",
    page: 30,
    crop: [65, 748, 1111, 900],
    constructed: true,
    points: [point("A", 350, 650), point("B", 590, 650), point("C", 520, 480)],
    shapes: triangles("ABC"),
    prompt:
      "Tom wants to construct △ABC with AB = 4 cm and ∠A = 45°. Suggest one additional piece of information that fixes its shape and size.",
    solutionPages: [9],
    sourceNote:
      "The printed figure shows AB and a 45° ray from A; it does not locate C. The displayed C and BC are illustrative. The printed solution correctly suggests AC (SAS) or ∠B (ASA). Specifying BC alone is not generally sufficient because SSA can give two triangles.",
    steps: [
      {
        text: "Since the length of AB and the size of one of its adjacent angles, ∠A, are given, the shape and the size of △ABC can be fixed by SAS or ASA.",
        highlights: { sides: ["AB"], angles: ["BAC"], figures: ["ABC"] },
      },
      {
        text: "For the condition SAS, ∠A should be the included angle.",
        highlights: { angles: ["BAC"], sides: ["AB", "AC"] },
      },
      {
        text: "So, the additional information needed is the length of AC.",
        highlights: { sides: ["AC"] },
      },
      {
        text: "For the condition ASA, AB should be the included side.",
        highlights: { sides: ["AB"], angles: ["BAC", "ABC"] },
      },
      {
        text: "So, the additional information needed is the size of ∠B.",
        highlights: { angles: ["ABC"] },
      },
    ],
  },
  {
    id: "ex5b-30",
    group: "Exercise 5B",
    number: "30",
    page: 30,
    crop: [64, 910, 1111, 1157],
    points: [
      point("A", 857, 949),
      point("B", 1071, 949),
      point("C", 1030, 1129),
      point("D", 897, 1129),
      point("E", 963, 1059),
    ],
    shapes: triangles("ADE", "BCE", "ADC", "BCD", "ADB", "BCA"),
    prompt:
      "AEC and BED are straight lines. CE = DE, AD = BC and AE = BE. Name two different pairs of congruent triangles and give the reasons.",
    solutionPages: [9],
    steps: [
      intro("In △ADE and △BCE,", "ADE", "BCE"),
      line(tex`AD=BC`, { sides: ["AD", "BC"] }, "given"),
      line(tex`DE=CE`, { sides: ["DE", "CE"] }, "given"),
      line(tex`AE=BE`, { sides: ["AE", "BE"] }, "given"),
      line(
        tex`\therefore\triangle ADE\cong\triangle BCE`,
        { figures: ["ADE", "BCE"] },
        "SSS",
        { conclusion: true },
      ),
      line(tex`AC=AE+EC`, { sides: ["AC", "AE", "EC"] }),
      line(tex`=BE+ED`, { sides: ["BE", "ED"] }, "given"),
      line(tex`=BD`, { sides: ["BD", "AC"] }),
      intro("In △ADC and △BCD,", "ADC", "BCD"),
      line(tex`AC=BD`, { sides: ["AC", "BD"] }),
      line(tex`AD=BC`, { sides: ["AD", "BC"] }, "given"),
      line(tex`DC=CD`, { sides: ["DC", "CD"] }, "common side"),
      line(
        tex`\therefore\triangle ADC\cong\triangle BCD`,
        { figures: ["ADC", "BCD"] },
        "SSS",
        { conclusion: true },
      ),
      intro("In △ADB and △BCA,", "ADB", "BCA"),
      line(tex`BD=AC`, { sides: ["BD", "AC"] }, "proved"),
      line(tex`AD=BC`, { sides: ["AD", "BC"] }, "given"),
      line(tex`AB=BA`, { sides: ["AB", "BA"] }, "common side"),
      line(
        tex`\therefore\triangle ADB\cong\triangle BCA`,
        { figures: ["ADB", "BCA"] },
        "SSS",
        { conclusion: true },
      ),
      { text: "(or any other reasonable answers)", highlights: {} },
    ],
  },
];
