import type { Point, SourceQuestion } from "./types";

// Traced from textbook PDF pages 12, 13, 26 and 27 at 1225 × 1616 px.
// Fractions refer to the whole page; crops are [left, top, right, bottom].
const point = (label: string, x: number, y: number): Point => ({
  label,
  x: x / 1225,
  y: y / 1616,
});
const crop = (
  left: number,
  top: number,
  right: number,
  bottom: number,
): SourceQuestion["crop"] => [
  left / 1225,
  top / 1616,
  right / 1225,
  bottom / 1616,
];

// Exact illustrative models for the two questions that have no printed diagram.
function constructedPair(
  names: [string, string],
  sides: [number, number, number],
  ratio: number,
) {
  const [ab, bc, ca] = sides;
  const x = (ab * ab + ca * ca - bc * bc) / (2 * ab);
  const y = Math.sqrt(ca * ca - x * x);
  const factor = 235 / Math.max(ab, bc, ca);
  const base = [
    [0, 0],
    [ab, 0],
    [x, -y],
  ];
  return names.flatMap((name, i) =>
    base.map(([px, py], j) => ({
      label: name[j],
      x: (190 + i * 350 + px * factor * (i ? 1 / ratio : 1)) / 1000,
      y: (400 + py * factor * (i ? 1 / ratio : 1)) / 1320,
    })),
  );
}

export const questionsAB: SourceQuestion[] = [
  {
    id: "ex8a-12",
    group: "Exercise 8A",
    number: "12",
    page: 12,
    crop: crop(80, 160, 1120, 279),
    constructed: true,
    points: constructedPair(
      ["ABC", "DEF"],
      [
        Math.sin((70 * Math.PI) / 180),
        Math.sin((60 * Math.PI) / 180),
        Math.sin((50 * Math.PI) / 180),
      ],
      1.3,
    ),
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△DEF", vertices: ["D", "E", "F"] },
    ],
    prompt: "Given △ABC ∼ △DEF, ∠B = 50° and ∠F = 70°. Find ∠E and ∠A.",
    proof: [
      "The order ABC ↔ DEF gives B ↔ E and C ↔ F.",
      "∠E = ∠B = 50° and ∠C = ∠F = 70°.",
      "∠A = 180° − 50° − 70° = 60°.",
    ],
    result: "(a) ∠E = 50°. (b) ∠A = 60°.",
  },
  {
    id: "ex8a-13",
    group: "Exercise 8A",
    number: "13",
    page: 12,
    crop: crop(80, 290, 1120, 408),
    constructed: true,
    points: constructedPair(["ABC", "XYZ"], [12, 19.2, 28.8], 12 / 5),
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△XYZ", vertices: ["X", "Y", "Z"] },
    ],
    prompt:
      "Given △ABC ∼ △XYZ, XY = 5 cm, YZ = 8 cm and AB = XZ = 12 cm. Find BC and AC.",
    proof: [
      "The scale factor from △XYZ to △ABC is AB/XY = 12/5.",
      "BC = 8 × 12/5 = 19.2 cm.",
      "AC = 12 × 12/5 = 28.8 cm.",
    ],
    result: "(a) BC = 19.2 cm. (b) AC = 28.8 cm.",
  },
  {
    id: "ex8a-14",
    group: "Exercise 8A",
    number: "14",
    page: 12,
    crop: crop(80, 419, 1100, 644),
    points: [
      point("A", 681, 475),
      point("B", 833, 618),
      point("C", 943, 618),
      point("Q", 1058, 618),
      point("P", 960, 520),
      point("R", 960, 449),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△QPR", vertices: ["Q", "P", "R"] },
    ],
    prompt: "Given △ABC ∼ △QPR, find x and y.",
    proof: [
      "B corresponds to P, so ∠B = 135°.",
      "x + 135° + 2x = 180°, giving x = 15°.",
      "R corresponds to C, so y = 2x = 30°.",
    ],
    result: "x = 15°, y = 30°.",
  },
  {
    id: "ex8a-15",
    group: "Exercise 8A",
    number: "15",
    page: 12,
    crop: crop(80, 650, 1110, 833),
    points: [
      point("P", 863, 691),
      point("Q", 774, 758),
      point("R", 912, 758),
      point("T", 951, 809),
      point("S", 1019, 758),
    ],
    shapes: [
      { name: "△PQR", vertices: ["P", "Q", "R"] },
      { name: "△TSR", vertices: ["T", "S", "R"] },
    ],
    prompt: "Given △PQR ∼ △TSR, find QR and RT.",
    proof: [
      "PQ/TS = 8/6 = 4/3.",
      "QR/SR = 4/3, so QR = 7.5 × 4/3 = 10 cm.",
      "PR/TR = 4/3, so RT = 6 × 3/4 = 4.5 cm.",
    ],
    result: "(a) QR = 10 cm. (b) RT = 4.5 cm.",
  },
  {
    id: "ex8a-16",
    group: "Exercise 8A",
    number: "16",
    page: 12,
    crop: crop(80, 850, 1120, 1024),
    points: [
      point("A", 781, 882),
      point("B", 822, 995),
      point("C", 1066, 995),
      point("D", 838, 904),
      point("E", 872, 995),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△DEC", vertices: ["D", "E", "C"] },
    ],
    prompt: "ADC and BEC are straight lines. Given △ABC ∼ △DEC, find y.",
    proof: [
      "BC = y + 4 cm and EC = y cm.",
      "EC/BC = DE/AB, so y/(y + 4) = 8/10.",
      "10y = 8y + 32, giving y = 16.",
    ],
    result: "y = 16.",
  },
  {
    id: "ex8a-17",
    group: "Exercise 8A",
    number: "17",
    page: 12,
    crop: crop(80, 1045, 1120, 1195),
    points: [
      point("A", 777, 1061),
      point("B", 996, 1163),
      point("C", 1030, 1070),
      point("D", 1035, 1165),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△CDB", vertices: ["C", "D", "B"] },
    ],
    prompt: "Given △ABC ∼ △CDB, find ∠ABC and ∠ACD.",
    proof: [
      "∠ABC corresponds to ∠CDB, so ∠ABC = 85°.",
      "In △CBD, ∠CBD = 180° − 85° − 23° = 72°.",
      "∠ACB = ∠CBD = 72°, so ∠ACD = 72° + 23° = 95°.",
    ],
    result: "(a) ∠ABC = 85°. (b) ∠ACD = 95°.",
  },
  {
    id: "ex8a-18",
    group: "Exercise 8A",
    number: "18",
    page: 12,
    crop: crop(80, 1208, 1110, 1445),
    points: [
      point("A", 845, 1423),
      point("B", 982, 1423),
      point("C", 888, 1239),
      point("D", 859, 1364),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△ADB", vertices: ["A", "D", "B"] },
    ],
    prompt: "ADC is a straight line and △ABC ∼ △ADB. Find x and y.",
    proof: [
      "∠ABD corresponds to ∠ACB, so ∠ABD = 40°.",
      "In △ADB, x = 180° − 63° − 40° = 77°.",
      "The exterior angle at D of △BCD is 63°, so y + 40° = 63° and y = 23°.",
    ],
    result: "x = 77°, y = 23°.",
  },
  {
    id: "ex8a-19",
    group: "Exercise 8A",
    number: "19",
    page: 13,
    crop: crop(135, 105, 1145, 308),
    points: [
      point("A", 991, 135),
      point("B", 923, 278),
      point("C", 1123, 278),
      point("K", 1002, 278),
      point("H", 965, 190),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△KBH", vertices: ["K", "B", "H"] },
    ],
    prompt:
      "H lies on AB and K lies on BC. AH = 3 cm, HB = 5 cm, BK = 4 cm and △ABC ∼ △KBH. Find KC.",
    proof: [
      "AB = AH + HB = 8 cm.",
      "BC/BH = AB/KB = 8/4 = 2, so BC = 10 cm.",
      "KC = BC − BK = 10 − 4 = 6 cm.",
    ],
    result: "KC = 6 cm.",
  },
  {
    id: "ex8a-20",
    group: "Exercise 8A",
    number: "20",
    page: 13,
    crop: crop(135, 325, 1145, 572),
    points: [
      point("A", 949, 355),
      point("B", 905, 474),
      point("C", 1053, 474),
      point("D", 876, 553),
      point("E", 1124, 553),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△ADE", vertices: ["A", "D", "E"] },
    ],
    prompt:
      "B and C lie on AD and AE respectively. Given △ABC ∼ △ADE, find x and y.",
    proof: [
      "∠ACB = ∠AED = 49°, so x = 180° − 61° − 49° = 70°.",
      "AD = 6 + 4 = 10 cm and AE = y + 5 cm.",
      "AC/AE = AB/AD gives y/(y + 5) = 6/10; hence y = 7.5.",
    ],
    result: "x = 70°, y = 7.5.",
  },
  {
    id: "ex8a-21",
    group: "Exercise 8A",
    number: "21",
    page: 13,
    crop: crop(135, 589, 1145, 750),
    points: [
      point("A", 949, 636),
      point("B", 827, 724),
      point("C", 1122, 724),
      point("D", 1046, 620),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△DAC", vertices: ["D", "A", "C"] },
    ],
    prompt: "Given △ABC ∼ △DAC, find AB, DC and ∠BCD.",
    proof: [
      "AB/DA = BC/AC = 6/4, so AB = 3 cm.",
      "DC/AC = AC/BC = 4/6, so DC = 8/3 cm.",
      "∠DAC = ∠ABC = 36°, hence ∠ACD = 180° − 117° − 36° = 27°.",
      "∠BCA = ∠ACD = 27°, so ∠BCD = 27° + 27° = 54°.",
    ],
    result: "(a) AB = 3 cm. (b) DC = 8/3 cm. (c) ∠BCD = 54°.",
  },
  {
    id: "ex8a-22",
    group: "Exercise 8A",
    number: "22",
    page: 13,
    crop: crop(135, 772, 1145, 981),
    points: [
      point("A", 892, 951),
      point("B", 1007, 951),
      point("E", 1007, 866),
      point("D", 1007, 799),
      point("C", 1121, 951),
    ],
    shapes: [
      { name: "△ABE", vertices: ["A", "B", "E"] },
      { name: "△DBC", vertices: ["D", "B", "C"] },
    ],
    prompt:
      "ABC and DEB are straight lines and △ABE ∼ △DBC. Find BE, then decide whether AB and BC are equal.",
    proof: [
      "BE/BC = AE/DC = 15/20, so BE = 12 × 15/20 = 9 cm.",
      "DB = DE + EB = 7 + 9 = 16 cm.",
      "AB/DB = AE/DC = 15/20, so AB = 16 × 15/20 = 12 cm = BC.",
    ],
    result: "(a) BE = 9 cm. (b) Yes; AB = BC = 12 cm.",
  },
  {
    id: "ex8b-16",
    group: "Exercise 8B",
    number: "16",
    page: 26,
    crop: crop(80, 247, 552, 491),
    points: [
      point("A", 331, 274),
      point("B", 393, 443),
      point("C", 207, 443),
      point("D", 167, 332),
      point("E", 287, 332),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△CDE", vertices: ["C", "D", "E"] },
    ],
    prompt:
      "Name a pair of similar triangles and prove your answer. AEC is a straight line.",
    proof: [
      "In △ABC, ∠CAB = 180° − 54° − 70° = 56°.",
      "In △CDE, ∠CED = 180° − 70° − 56° = 54°.",
      "∠ABC = ∠CDE = 70°, ∠ACB = ∠CED = 54°, and ∠CAB = ∠ECD = 56°.",
      "Therefore △ABC ∼ △CDE (AAA).",
    ],
    result: "△ABC ∼ △CDE (AAA). A ↔ C, B ↔ D, C ↔ E.",
  },
  {
    id: "ex8b-17",
    group: "Exercise 8B",
    number: "17",
    page: 26,
    crop: crop(590, 240, 1120, 491),
    points: [
      point("C", 670, 413),
      point("D", 725, 374),
      point("B", 725, 273),
      point("A", 845, 463),
    ],
    shapes: [
      { name: "△CDB", vertices: ["C", "D", "B"] },
      { name: "△BDA", vertices: ["B", "D", "A"] },
    ],
    prompt:
      "Name a pair of similar triangles and prove your answer using the given lengths.",
    proof: [
      "CD/BD = 8/12 = 2/3.",
      "DB/DA = 12/18 = 2/3 and BC/AB = 18/27 = 2/3.",
      "All three pairs of corresponding sides are proportional; therefore △CDB ∼ △BDA (3 sides proportional).",
    ],
    result:
      "△CDB ∼ △BDA. C ↔ B, D ↔ D, B ↔ A; scale factor 3/2 from the first triangle to the second.",
  },
  {
    id: "ex8b-18",
    group: "Exercise 8B",
    number: "18",
    page: 26,
    crop: crop(80, 501, 552, 750),
    points: [
      point("A", 300, 535),
      point("B", 165, 721),
      point("C", 408, 685),
      point("E", 434, 721),
      point("D", 469, 675),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△EDC", vertices: ["E", "D", "C"] },
    ],
    prompt:
      "Name a pair of similar triangles and prove your answer using the given lengths and angles.",
    proof: [
      "CE/CA = 3/12 = 1/4 and CD/CB = 4/16 = 1/4.",
      "The included angles ∠ACB and ∠ECD are both 63°.",
      "Therefore △ABC ∼ △EDC (ratio of 2 sides, included angle).",
    ],
    result: "△ABC ∼ △EDC. A ↔ E, B ↔ D, C ↔ C.",
  },
  {
    id: "ex8b-19",
    group: "Exercise 8B",
    number: "19",
    page: 26,
    crop: crop(590, 500, 1120, 750),
    points: [
      point("A", 710, 535),
      point("B", 687, 624),
      point("D", 798, 624),
      point("C", 672, 674),
      point("E", 852, 674),
    ],
    shapes: [
      { name: "△ABD", vertices: ["A", "B", "D"] },
      { name: "△ACE", vertices: ["A", "C", "E"] },
    ],
    prompt:
      "ABC and ADE are straight lines. Name a pair of similar triangles and prove your answer.",
    proof: [
      "AC = 15 + 10 = 25 and AE = 18 + 12 = 30.",
      "AC/AB = 25/15 = 5/3 and AE/AD = 30/18 = 5/3.",
      "∠BAD = ∠CAE is the common included angle.",
      "Therefore △ABD ∼ △ACE (ratio of 2 sides, included angle).",
    ],
    result: "△ABD ∼ △ACE. A ↔ A, B ↔ C, D ↔ E.",
  },
  {
    id: "ex8b-20",
    group: "Exercise 8B",
    number: "20",
    page: 26,
    crop: crop(80, 778, 1120, 951),
    points: [
      point("P", 840, 920),
      point("Q", 861, 813),
      point("S", 893, 920),
      point("R", 1063, 920),
    ],
    shapes: [
      { name: "△PQS", vertices: ["P", "Q", "S"] },
      { name: "△PRQ", vertices: ["P", "R", "Q"] },
    ],
    prompt: "PSR is a straight line. Prove that △PQS ∼ △PRQ.",
    proof: [
      "∠PQS = ∠PRQ = 28° (given).",
      "∠QPS = ∠RPQ (common angle).",
      "The remaining angles ∠PSQ and ∠PQR are equal by the angle sum of a triangle.",
      "Therefore △PQS ∼ △PRQ (AAA).",
    ],
    result: "△PQS ∼ △PRQ (AAA). P ↔ P, Q ↔ R, S ↔ Q.",
  },
  {
    id: "ex8b-21",
    group: "Exercise 8B",
    number: "21",
    page: 26,
    crop: crop(80, 968, 1120, 1148),
    points: [
      point("A", 944, 989),
      point("B", 882, 1122),
      point("D", 979, 1024),
      point("C", 1066, 1113),
      point("E", 920, 1041),
    ],
    shapes: [
      { name: "△ABD", vertices: ["A", "B", "D"] },
      { name: "△ACE", vertices: ["A", "C", "E"] },
    ],
    prompt:
      "AEB and ADC are straight lines, BD ⟂ AC and CE ⟂ AB. Prove that △ABD ∼ △ACE.",
    proof: [
      "∠ADB = ∠AEC = 90° (perpendicular lines).",
      "∠BAD = ∠CAE (common angle).",
      "The remaining angles ∠ABD and ∠ACE are equal by the angle sum of a triangle.",
      "Therefore △ABD ∼ △ACE (AAA).",
    ],
    result: "△ABD ∼ △ACE (AAA). A ↔ A, B ↔ C, D ↔ E.",
  },
  {
    id: "ex8b-22",
    group: "Exercise 8B",
    number: "22",
    page: 26,
    crop: crop(80, 1162, 1120, 1368),
    points: [
      point("A", 890, 1268),
      point("B", 914, 1332),
      point("C", 1018, 1332),
      point("D", 1068, 1189),
      point("E", 950, 1298),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△BCD", vertices: ["B", "C", "D"] },
    ],
    prompt:
      "AEC and BED are straight lines and ∠ABC = ∠BCD. Prove that △ABC ∼ △BCD.",
    proof: [
      "AB/BC = 4/6 = 2/3 and BC/CD = 6/9 = 2/3.",
      "The included angles ∠ABC and ∠BCD are equal (given).",
      "Therefore △ABC ∼ △BCD (ratio of 2 sides, included angle).",
    ],
    result: "△ABC ∼ △BCD. A ↔ B, B ↔ C, C ↔ D.",
  },
  {
    id: "ex8b-23",
    group: "Exercise 8B",
    number: "23",
    page: 26,
    // The supplied PDF's footer crosses the bottom of this diagram.
    crop: crop(80, 1374, 1120, 1575),
    points: [
      point("A", 848, 1555),
      point("B", 955, 1529),
      point("E", 906, 1499),
      point("D", 1007, 1405),
      point("C", 1007, 1516),
    ],
    shapes: [
      { name: "△ABE", vertices: ["A", "B", "E"] },
      { name: "△ADC", vertices: ["A", "D", "C"] },
    ],
    prompt:
      "ABC and AED are straight lines. Prove that △ABE ∼ △ADC. If BE = 1.8 cm, find CD.",
    proof: [
      "AD = 3 + 5 = 8 cm and AC = 4 + 2 = 6 cm.",
      "AD/AB = 8/4 = 2 and AC/AE = 6/3 = 2.",
      "∠BAE = ∠DAC (common included angle), so △ABE ∼ △ADC (ratio of 2 sides, included angle).",
      "CD/BE = AC/AE = 2, so CD = 2 × 1.8 = 3.6 cm.",
    ],
    result: "(a) △ABE ∼ △ADC. (b) CD = 3.6 cm.",
  },
  {
    id: "ex8b-24",
    group: "Exercise 8B",
    number: "24",
    page: 27,
    crop: crop(135, 106, 1145, 284),
    points: [
      point("R", 904, 260),
      point("Q", 988, 190),
      point("S", 1001, 260),
      point("T", 1120, 260),
      point("P", 1048, 138),
    ],
    shapes: [
      { name: "△RQS", vertices: ["R", "Q", "S"] },
      { name: "△RTP", vertices: ["R", "T", "P"] },
    ],
    prompt:
      "PQR and TSR are straight lines and ∠RQS = ∠RTP. Prove that △RQS ∼ △RTP, then find ST.",
    proof: [
      "∠RQS = ∠RTP (given) and ∠QRS = ∠TRP (common angle).",
      "The third pair of angles is equal, so △RQS ∼ △RTP (AAA).",
      "RP = 10 + 10 = 20 cm and RT = 8 + ST cm.",
      "RQ/RT = RS/RP gives 10/(8 + ST) = 8/20, hence ST = 17 cm.",
    ],
    result: "(a) △RQS ∼ △RTP (AAA). (b) ST = 17 cm.",
  },
  {
    id: "ex8b-25",
    group: "Exercise 8B",
    number: "25",
    page: 27,
    crop: crop(135, 304, 1145, 495),
    points: [
      point("P", 894, 333),
      point("Q", 991, 471),
      point("R", 1094, 471),
      point("T", 940, 365),
      point("S", 1067, 398),
    ],
    shapes: [
      { name: "△PQR", vertices: ["P", "Q", "R"] },
      { name: "△TSR", vertices: ["T", "S", "R"] },
    ],
    prompt:
      "PTR is a straight line. Prove that △PQR ∼ △TSR, then decide whether PR bisects ∠QRS.",
    proof: [
      "PR = PT + TR = 7 + 21 = 28 cm.",
      "TS/PQ = 15/20 = 3/4, SR/QR = 9/12 = 3/4 and TR/PR = 21/28 = 3/4.",
      "Therefore △PQR ∼ △TSR (3 sides proportional).",
      "∠PRQ = ∠TRS (corresponding angles). Since R, T and P lie on the same ray from R, PR bisects ∠QRS.",
    ],
    result: "(a) △PQR ∼ △TSR. (b) Yes; ∠QRP = ∠PRS.",
  },
  {
    id: "ex8b-26",
    group: "Exercise 8B",
    number: "26",
    page: 27,
    crop: crop(135, 513, 1145, 691),
    points: [
      point("A", 1098, 545),
      point("D", 1046, 575),
      point("C", 1098, 666),
      point("B", 884, 666),
    ],
    shapes: [
      { name: "△ADC", vertices: ["A", "D", "C"] },
      { name: "△ACB", vertices: ["A", "C", "B"] },
    ],
    prompt:
      "ADB is a straight line. Prove that △ADC ∼ △ACB. If ∠ABC = 30° and ∠BAC = 60°, decide whether △ADC is right-angled.",
    proof: [
      "AB = 6 + 2 = 8 cm, so AB/AC = 8/4 = 2 and AC/AD = 4/2 = 2.",
      "∠CAD = ∠BAC (common included angle), hence △ADC ∼ △ACB (ratio of 2 sides, included angle).",
      "∠ACB = 180° − 30° − 60° = 90°.",
      "∠ADC corresponds to ∠ACB, so ∠ADC = 90° and △ADC is right-angled.",
    ],
    result: "(a) △ADC ∼ △ACB. (b) Yes; ∠ADC = 90°.",
  },
];
