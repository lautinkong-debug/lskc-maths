import type { Point, SourceQuestion } from "./types";

// Source traces use the supplied page-31.png (1041 × 1374) and
// page-32.png (980 × 1293). Fractions refer to the complete PDF page.
const point31 = (label: string, x: number, y: number): Point => ({
  label,
  x: x / 1041,
  y: y / 1374,
});
const point32 = (label: string, x: number, y: number): Point => ({
  label,
  x: x / 980,
  y: y / 1293,
});
const crop31 = (
  l: number,
  t: number,
  r: number,
  b: number,
): SourceQuestion["crop"] => [l / 1041, t / 1374, r / 1041, b / 1374];
const crop32 = (
  l: number,
  t: number,
  r: number,
  b: number,
): SourceQuestion["crop"] => [l / 980, t / 1293, r / 980, b / 1293];

export const questionsCRest: SourceQuestion[] = [
  {
    id: "ex8c-10",
    group: "Exercise 8C",
    number: "10",
    page: 31,
    crop: crop31(115, 516, 977, 704),
    points: [
      point31("A", 835, 544),
      point31("B", 767, 675),
      point31("D", 831, 675),
      point31("C", 900, 675),
      point31("E", 885, 645),
    ],
    shapes: [
      { name: "△ABD", vertices: ["A", "B", "D"] },
      { name: "△DCE", vertices: ["D", "C", "E"] },
    ],
    prompt:
      "ABC is isosceles with AB = AC. D lies on BC and E lies on AC. AB = 30 cm, BD = 14 cm, CD = 15 cm and CE = 7 cm. Prove that △ABD ∼ △DCE.",
    proof: [
      "DC/AB = 15/30 = 1/2 and CE/BD = 7/14 = 1/2.",
      "∠ABC = ∠BCA because AB = AC (base angles of an isosceles triangle). Hence ∠ABD = ∠DCE.",
      "Therefore △ABD ∼ △DCE (ratio of 2 sides, included angle).",
    ],
    result: "△ABD ∼ △DCE. A ↔ D, B ↔ C, D ↔ E.",
  },
  {
    id: "ex8c-11",
    group: "Exercise 8C",
    number: "11",
    page: 31,
    crop: crop31(115, 711, 977, 863),
    points: [
      point31("A", 812, 839),
      point31("B", 933, 839),
      point31("D", 874, 803),
      point31("C", 761, 731),
      point31("E", 797, 803),
    ],
    shapes: [
      { name: "△ABD", vertices: ["A", "B", "D"] },
      { name: "△DCE", vertices: ["D", "C", "E"] },
    ],
    prompt:
      "ABC is isosceles with AB = AC. D lies on BC and E lies on AC, with ∠BAD = ∠CDE. Prove that △ABD ∼ △DCE.",
    proof: [
      "∠ABC = ∠BCA because AB = AC (base angles of an isosceles triangle), so ∠ABD = ∠DCE.",
      "∠BAD = ∠CDE (given).",
      "The remaining angles ∠ADB and ∠DEC are equal by the angle sum of a triangle.",
      "Therefore △ABD ∼ △DCE (AAA).",
    ],
    result: "△ABD ∼ △DCE (AAA). A ↔ D, B ↔ C, D ↔ E.",
  },
  {
    id: "ex8c-12",
    group: "Exercise 8C",
    number: "12",
    page: 31,
    crop: crop31(115, 877, 977, 1065),
    points: [
      point31("A", 862, 901),
      point31("B", 765, 1041),
      point31("C", 862, 984),
      point31("D", 906, 1009),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△DAC", vertices: ["D", "A", "C"] },
    ],
    prompt:
      "Name and prove a pair of similar triangles using the given lengths. Then find ∠ACB.",
    proof: [
      "DA/AB = 21/35 = 3/5, AC/BC = 15/25 = 3/5, and DC/AC = 9/15 = 3/5.",
      "Therefore △ABC ∼ △DAC (3 sides proportional), with A ↔ D, B ↔ A and C ↔ C.",
      "∠ACB = ∠DCA (corresponding angles).",
      "Angles around C give ∠ACB + ∠DCA + 120° = 360°, so ∠ACB = 120°.",
    ],
    result: "(a) △ABC ∼ △DAC. (b) ∠ACB = 120°.",
  },
  {
    id: "ex8c-13",
    group: "Exercise 8C",
    number: "13",
    page: 31,
    crop: crop31(115, 1075, 977, 1255),
    points: [
      point31("O", 899, 1131),
      point31("A", 747, 1234),
      point31("B", 931, 1234),
      point31("C", 951, 1096),
      point31("D", 888, 1096),
    ],
    shapes: [
      { name: "△OAB", vertices: ["O", "A", "B"] },
      { name: "△OCD", vertices: ["O", "C", "D"] },
    ],
    prompt:
      "AC and BD intersect at O. Name and prove a pair of similar triangles, then decide whether DC ∥ AB.",
    proof: [
      "OC/OA = 5/15 = 1/3 and OD/OB = 3/9 = 1/3.",
      "∠AOB = ∠COD (vertically opposite angles), so △OAB ∼ △OCD (ratio of 2 sides, included angle).",
      "∠ODC = ∠OBA (corresponding angles of similar triangles).",
      "Therefore DC ∥ AB (alternate angles equal).",
    ],
    result: "(a) △OAB ∼ △OCD. (b) Yes; DC ∥ AB.",
  },
  {
    id: "ex8c-14",
    group: "Exercise 8C",
    number: "14",
    page: 32,
    crop: crop32(64, 87, 893, 213),
    points: [
      point32("A", 710, 109),
      point32("B", 655, 109),
      point32("C", 635, 188),
      point32("D", 852, 188),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△CAD", vertices: ["C", "A", "D"] },
    ],
    prompt:
      "Name and prove a pair of similar triangles using the given lengths. Then decide whether BA ∥ CD.",
    proof: [
      "CA/AB = 8/4 = 2, AD/BC = 12/6 = 2 and CD/AC = 16/8 = 2.",
      "Therefore △ABC ∼ △CAD (3 sides proportional).",
      "∠BAC = ∠ACD (corresponding angles), so BA ∥ CD (alternate angles equal).",
    ],
    result: "(a) △ABC ∼ △CAD. (b) Yes; BA ∥ CD.",
  },
  {
    id: "ex8c-15",
    group: "Exercise 8C",
    number: "15",
    page: 32,
    crop: crop32(64, 224, 893, 352),
    points: [
      point32("A", 833, 252),
      point32("E", 776, 329),
      point32("F", 833, 329),
      point32("D", 641, 329),
      point32("C", 753, 244),
      point32("B", 800, 294),
    ],
    shapes: [
      { name: "△AEF", vertices: ["A", "E", "F"] },
      { name: "△DFC", vertices: ["D", "F", "C"] },
    ],
    prompt:
      "ABE, CBF and DEF are straight lines; AE = 5 cm and CF = 6 cm. Prove that △AEF ∼ △DFC, then decide whether BE = BF.",
    proof: [
      "DF = DE + EF = 7 + 3 = 10 cm.",
      "AE/DF = 5/10 = 1/2, AF/DC = 4/8 = 1/2 and EF/FC = 3/6 = 1/2.",
      "Therefore △AEF ∼ △DFC (3 sides proportional).",
      "∠AEF = ∠DFC, so ∠BEF = ∠BFE. Therefore BE = BF (sides opposite equal angles).",
    ],
    result: "(a) △AEF ∼ △DFC. (b) Yes; BE = BF.",
  },
  {
    id: "ex8c-16",
    group: "Exercise 8C",
    number: "16",
    page: 32,
    crop: crop32(64, 366, 893, 531),
    points: [
      point32("A", 661, 382),
      point32("B", 716, 506),
      point32("D", 840, 506),
      point32("E", 858, 465),
      point32("C", 800, 506),
      point32("F", 821, 492),
    ],
    shapes: [
      { name: "△ABD", vertices: ["A", "B", "D"] },
      { name: "△EDC", vertices: ["E", "D", "C"] },
    ],
    prompt:
      "AFD, EFC and BCD are straight lines; ∠ABC = ∠EDC and CF = DF. Prove that △ABD ∼ △EDC. Given AB = 9 cm, BC = 5 cm and DE = 3 cm, find CD.",
    proof: [
      "∠ABD = ∠EDC (given, since B, C and D lie on a straight line).",
      "CF = DF gives ∠FDC = ∠FCD (base angles of an isosceles triangle), hence ∠ADB = ∠ECD.",
      "The third pair of angles is equal; therefore △ABD ∼ △EDC (AAA).",
      "Let CD = x cm. CD/DB = ED/AB gives x/(x + 5) = 3/9, so 3x = x + 5 and CD = 2.5 cm.",
    ],
    result: "(a) △ABD ∼ △EDC (AAA). (b) CD = 2.5 cm.",
  },
  {
    id: "ex8c-17",
    group: "Exercise 8C",
    number: "17",
    page: 32,
    crop: crop32(64, 542, 893, 716),
    points: [
      point32("C", 699, 628),
      point32("A", 631, 599),
      point32("B", 661, 657),
      point32("E", 805, 674),
      point32("D", 761, 586),
      point32("G", 857, 696),
      point32("F", 790, 566),
    ],
    shapes: [
      { name: "△CAB", vertices: ["C", "A", "B"] },
      { name: "△CED", vertices: ["C", "E", "D"] },
      { name: "△CGF", vertices: ["C", "G", "F"] },
    ],
    prompt:
      "ACEG and BCDF are straight lines, with BA ∥ ED ∥ GF. Prove that △CAB ∼ △CED ∼ △CGF, then find AB and DF.",
    proof: [
      "For △CAB and △CED, the angles at C are vertically opposite; the other pairs are equal alternate angles because BA ∥ ED. Thus △CAB ∼ △CED (AAA).",
      "For △CED and △CGF, the angle at C is common; the other pairs are equal corresponding angles because ED ∥ GF. Thus △CED ∼ △CGF (AAA).",
      "AB/ED = BC/DC = 2/3, so AB = 4 × 2/3 = 8/3 cm.",
      "CF/CD = GF/ED = 6/4, so CF = 3 × 6/4 = 4.5 cm and DF = 4.5 − 3 = 1.5 cm.",
    ],
    result: "(a) △CAB ∼ △CED ∼ △CGF. (b) AB = 8/3 cm and DF = 1.5 cm.",
  },
  {
    id: "ex8c-18",
    group: "Exercise 8C",
    number: "18",
    page: 32,
    crop: crop32(64, 733, 893, 971),
    points: [
      point32("A", 717, 755),
      point32("B", 681, 853),
      point32("C", 835, 853),
      point32("D", 769, 798),
      point32("E", 750, 853),
      point32("F", 716, 947),
    ],
    shapes: [
      { name: "△ABC", vertices: ["A", "B", "C"] },
      { name: "△DEC", vertices: ["D", "E", "C"] },
      { name: "△BEF", vertices: ["B", "E", "F"] },
    ],
    prompt:
      "ADC, BEC and DEF are straight lines; AB ∥ DF and ∠DCE = ∠BFE. AB = 9 cm, BE = 6 cm and DE = 5 cm. Prove that △ABC ∼ △DEC ∼ △BEF, then find CE and EF.",
    proof: [
      "△ABC and △DEC share the angle at C, and their other pairs are corresponding angles because AB ∥ DF. Therefore △ABC ∼ △DEC (AAA).",
      "∠DCE = ∠BFE (given), and ∠DEC = ∠BEF (vertically opposite angles). The third pair is equal, so △DEC ∼ △BEF (AAA).",
      "Let CE = x cm. CE/CB = DE/AB gives x/(x + 6) = 5/9, so 9x = 5x + 30 and CE = 7.5 cm.",
      "EF/EC = BE/DE = 6/5, so EF = 7.5 × 6/5 = 9 cm.",
    ],
    result: "(a) △ABC ∼ △DEC ∼ △BEF. (b) CE = 7.5 cm and EF = 9 cm.",
  },
];
