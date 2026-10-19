import type { Point, SourceQuestion } from "./types";

// Traced from the supplied textbook at 1225 × 1616 pixels per full page.
// These outlines preserve the printed (not-to-scale) figures. The givens prove
// similarity; a visual match or a measured screen angle does not prove it.
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
): [number, number, number, number] => [
  left / 1225,
  top / 1616,
  right / 1225,
  bottom / 1616,
];

export const questionsRevision: SourceQuestion[] = [
  {
    id: "rev8-23",
    group: "Revision Exercise 8",
    number: "23",
    page: 51,
    crop: crop(133, 887, 1150, 1115),
    points: [
      point("A", 955, 920),
      point("B", 868, 1081),
      point("C", 1120, 1081),
      point("H", 929, 968),
      point("K", 959, 1081),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "KBH", vertices: ["K", "B", "H"] },
    ],
    prompt:
      "H lies on AB and K lies on BC. Given △ABC ∼ △KBH, BH = 7 cm, BK = 5 cm, KC = 9 cm and ∠HKC = 105°, find ∠BAC and AH.",
    proof: [
      "∠BKH = 180° − 105° = 75° (adjacent angles on a straight line).",
      "The given correspondence is A ↔ K, B ↔ B, C ↔ H. Thus ∠BAC = ∠BKH and AB/BK = BC/BH.",
      "BC = 5 + 9 = 14 cm, so AB/5 = 14/7 = 2. Hence AB = 10 cm and AH = 10 − 7 = 3 cm.",
    ],
    result: "∠BAC = 75°; AH = 3 cm.",
  },
  {
    id: "rev8-24",
    group: "Revision Exercise 8",
    number: "24",
    page: 51,
    crop: crop(133, 1125, 1151, 1303),
    points: [
      point("A", 928, 1157),
      point("B", 831, 1272),
      point("C", 1129, 1272),
      point("D", 1031, 1157),
      point("E", 979, 1186),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "DCB", vertices: ["D", "C", "B"] },
    ],
    prompt:
      "AEC and BED are straight lines, and △ABC ∼ △DCB. Given ∠BAC = 100° and ∠ABD = 20°, find x = ∠BDC and y = ∠ACB.",
    proof: [
      "The correspondence is A ↔ D, B ↔ C, C ↔ B. Hence x = ∠BAC = 100° and ∠DBC = ∠ACB = y.",
      "∠ABC = 20° + y. In △ABC, 100° + (20° + y) + y = 180°.",
      "2y = 60°, so y = 30°.",
    ],
    result: "x = 100°; y = 30°.",
  },
  {
    id: "rev8-25",
    group: "Revision Exercise 8",
    number: "25",
    page: 51,
    crop: crop(133, 1309, 1153, 1511),
    points: [
      point("A", 967, 1347),
      point("B", 856, 1483),
      point("C", 1051, 1437),
      point("D", 1113, 1424),
      point("E", 1082, 1341),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "DEC", vertices: ["D", "E", "C"] },
    ],
    prompt:
      "BCD is a straight line. AB = 14 cm, BC = 16 cm, AC = 10 cm, DE = 7 cm, EC = 8 cm, DC = 5 cm and ∠ACE = 60°. Identify and prove a pair of similar triangles, then find ∠ACB.",
    proof: [
      "AB/DE = 14/7 = 2, BC/EC = 16/8 = 2 and AC/DC = 10/5 = 2.",
      "Therefore △ABC ∼ △DEC (three sides proportional), with A ↔ D, B ↔ E, C ↔ C.",
      "Corresponding angles give ∠ACB = ∠DCE. On the straight line BCD, ∠ACB + 60° + ∠DCE = 180°, so ∠ACB = 60°.",
    ],
    result: "△ABC ∼ △DEC; ∠ACB = 60°.",
  },
  {
    id: "rev8-26",
    group: "Revision Exercise 8",
    number: "26",
    page: 52,
    crop: crop(81, 104, 1115, 282),
    points: [
      point("A", 1065, 135),
      point("B", 970, 135),
      point("C", 938, 198),
      point("D", 800, 266),
      point("E", 941, 266),
      point("F", 992, 171),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "DEF", vertices: ["D", "E", "F"] },
    ],
    prompt:
      "AFCD is a straight line and ∠ABC = ∠DEF. AB = 8 cm, BC = 6 cm, DE = 12 cm, EF = 9 cm, AF = 7 cm and CD = 13 cm. Prove a pair of triangles is similar, then find CF.",
    proof: [
      "DE/AB = 12/8 = 3/2 and EF/BC = 9/6 = 3/2. The included angles ∠DEF and ∠ABC are equal.",
      "Thus △ABC ∼ △DEF (ratio of two sides and the included angle), with A ↔ D, B ↔ E, C ↔ F.",
      "Let CF = t cm. AC = 7 + t and DF = 13 + t, so (13 + t)/(7 + t) = 3/2. Hence 26 + 2t = 21 + 3t and t = 5.",
    ],
    result: "△ABC ∼ △DEF; CF = 5 cm.",
  },
  {
    id: "rev8-27",
    group: "Revision Exercise 8",
    number: "27",
    page: 52,
    crop: crop(81, 282, 1035, 542),
    points: [
      point("A", 924, 342),
      point("B", 846, 510),
      point("C", 1004, 510),
      point("D", 896, 401),
      point("E", 896, 510),
      point("F", 985, 470),
    ],
    shapes: [
      { name: "BDE", vertices: ["B", "D", "E"] },
      { name: "CEF", vertices: ["C", "E", "F"] },
    ],
    prompt:
      "ADB, AFC and BEC are straight lines. AB = AC, DE ⟂ BC and EF ⟂ AC. Prove that △BDE ∼ △CEF.",
    proof: [
      "∠DEB = ∠EFC = 90° because DE ⟂ BC and EF ⟂ AC.",
      "AB = AC gives ∠ABC = ∠BCA (base angles of an isosceles triangle). Therefore ∠DBE = ∠ECF.",
      "The remaining angles ∠BDE and ∠CEF are equal by the angle sum of a triangle. Thus △BDE ∼ △CEF (AAA), with B ↔ C, D ↔ E, E ↔ F.",
    ],
    result: "△BDE ∼ △CEF (AAA).",
  },
  {
    id: "rev8-28",
    group: "Revision Exercise 8",
    number: "28",
    page: 52,
    crop: crop(81, 555, 1075, 734),
    points: [
      point("A", 965, 585),
      point("B", 846, 703),
      point("C", 1042, 703),
      point("D", 965, 703),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "DAC", vertices: ["D", "A", "C"] },
    ],
    prompt:
      "D lies on BC, ∠ADB = 90° and ∠ABD = ∠CAD. Prove △ABC ∼ △DAC, then decide whether BA ⟂ AC.",
    proof: [
      "Since B, D and C are collinear, ∠ABC = ∠DAC (given) and ∠ACB = ∠DCA (common angle). The third angles are also equal, so △ABC ∼ △DAC (AAA).",
      "∠ADC = 180° − ∠ADB = 90°.",
      "A ↔ D, so ∠BAC = ∠ADC = 90°. Therefore BA ⟂ AC. The printed diagram is not a measurement of this angle.",
    ],
    result: "△ABC ∼ △DAC; yes, BA ⟂ AC.",
  },
  {
    id: "rev8-29",
    group: "Revision Exercise 8",
    number: "29",
    page: 52,
    crop: crop(81, 748, 1100, 959),
    points: [
      point("A", 785, 833),
      point("B", 759, 909),
      point("C", 1021, 929),
      point("D", 1072, 778),
      point("O", 860, 864),
    ],
    shapes: [
      { name: "ABO", vertices: ["A", "B", "O"] },
      { name: "CDO", vertices: ["C", "D", "O"] },
    ],
    prompt:
      "AC and BD intersect at O. AO = 3 cm, BO = 4 cm, CO = 6 cm and DO = 8 cm. Prove a pair of triangles is similar, then decide whether AB ∥ DC.",
    proof: [
      "CO/AO = 6/3 = 2 and DO/BO = 8/4 = 2. Also ∠AOB = ∠COD (vertically opposite angles).",
      "Thus △ABO ∼ △CDO (ratio of two sides and the included angle), with A ↔ C, B ↔ D, O ↔ O.",
      "∠ABO = ∠CDO (corresponding angles). These are alternate angles on the transversal BD, so AB ∥ DC.",
    ],
    result: "△ABO ∼ △CDO; yes, AB ∥ DC.",
  },
  {
    id: "rev8-30",
    group: "Revision Exercise 8",
    number: "30",
    page: 52,
    crop: crop(81, 974, 1100, 1164),
    points: [
      point("A", 841, 1069),
      point("B", 974, 1002),
      point("C", 1065, 1069),
      point("D", 932, 1135),
      point("E", 965, 1069),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "CED", vertices: ["C", "E", "D"] },
    ],
    prompt:
      "AEC is a straight line. AB = 12 cm, BC = 9 cm, AE = 10 cm, EC = 8 cm, ED = 6 cm and CD = 12 cm. Prove a pair of triangles is similar, then decide whether AB ∥ DC.",
    proof: [
      "AC = 10 + 8 = 18 cm. CE/AB = 8/12 = 2/3, ED/BC = 6/9 = 2/3 and CD/AC = 12/18 = 2/3.",
      "Thus △ABC ∼ △CED (three sides proportional), with A ↔ C, B ↔ E, C ↔ D.",
      "∠BAC = ∠ECD (corresponding angles). These alternate angles on AC are equal, so AB ∥ DC.",
    ],
    result: "△ABC ∼ △CED; yes, AB ∥ DC.",
  },
  {
    id: "rev8-31",
    group: "Revision Exercise 8",
    number: "31",
    page: 52,
    crop: crop(81, 1180, 1110, 1379),
    points: [
      point("A", 1033, 1208),
      point("B", 1033, 1345),
      point("C", 862, 1345),
      point("D", 862, 1243),
      point("E", 991, 1243),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "CDE", vertices: ["C", "D", "E"] },
    ],
    prompt:
      "AEC is a straight line. ∠ABC = ∠CDE = 90°, AB = 16 cm, BC = 20 cm, CD = 12 cm and DE = 15 cm. Prove a pair of triangles is similar, then decide whether DC ⟂ CB.",
    proof: [
      "CD/AB = 12/16 = 3/4 and DE/BC = 15/20 = 3/4. The included angles at B and D are both 90°.",
      "Thus △ABC ∼ △CDE (ratio of two sides and the included angle), with A ↔ C, B ↔ D, C ↔ E.",
      "∠ACB = ∠CED, so CB ∥ DE (equal alternate angles). Since DC ⟂ DE, DC ⟂ CB.",
    ],
    result: "△ABC ∼ △CDE; yes, DC ⟂ CB.",
  },
  {
    id: "rev8-32",
    group: "Revision Exercise 8",
    number: "32",
    page: 53,
    crop: crop(133, 105, 1149, 280),
    points: [
      point("A", 1118, 134),
      point("B", 904, 255),
      point("C", 1118, 255),
      point("D", 1065, 164),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "ACD", vertices: ["A", "C", "D"] },
      { name: "CBD", vertices: ["C", "B", "D"] },
    ],
    prompt:
      "ADB is a straight line, ∠ACB = ∠ADC = 90°. Find and prove two triangles similar to △ABC. If AD = 4 cm and DC = 6 cm, find BD.",
    proof: [
      "△ABC and △ACD share the angle at A, and their right angles C and D correspond. The third angles are equal, so △ABC ∼ △ACD (AAA).",
      "△ABC and △CBD share the angle at B. ∠CDB = 90° because ADB is a straight line. Thus △ABC ∼ △CBD (AAA).",
      "Hence △ACD ∼ △CBD, with A ↔ C, C ↔ B, D ↔ D. Therefore BD/CD = CD/AD, so BD/6 = 6/4 and BD = 9 cm.",
    ],
    result: "△ABC ∼ △ACD ∼ △CBD; BD = 9 cm.",
  },
  {
    id: "rev8-33",
    group: "Revision Exercise 8",
    number: "33",
    page: 53,
    crop: crop(118, 278, 1153, 547),
    points: [
      point("A", 869, 442),
      point("B", 1125, 442),
      point("C", 1057, 375),
      point("D", 997, 315),
      point("E", 1053, 467),
      point("F", 1044, 442),
      point("G", 1023, 386),
    ],
    shapes: [
      { name: "AGF", vertices: ["A", "G", "F"] },
      { name: "BEF", vertices: ["B", "E", "F"] },
      { name: "ADG", vertices: ["A", "D", "G"] },
      { name: "DBE", vertices: ["D", "B", "E"] },
    ],
    prompt:
      "C lies on BD. DE meets AB at F and AC at G. AF:BF = 2:1, AD = BD, AC ∥ EB, ∠DAG = ∠BDE and AC ⟂ DE. Prove △AGF ∼ △BEF and △ADG ≅ △DBE, then find DG:EG.",
    proof: [
      "First compare AGF with BEF: angles at F are vertically opposite; the other corresponding angles are equal alternate angles because AC ∥ EB. Thus △AGF ∼ △BEF (AAA), A ↔ B, G ↔ E, F ↔ F.",
      "Then compare ADG with DBE: ∠DAG = ∠BDE (given), ∠AGD = ∠DEB = 90°, and AD = DB. Hence △ADG ≅ △DBE (AAS), A ↔ D, D ↔ B, G ↔ E.",
      "From similarity, AG/BE = AF/BF = 2. From congruence, DG = BE and DE = AG. Thus DE = 2DG, EG = DE − DG = DG and DG:EG = 1:1.",
    ],
    result:
      "△AGF ∼ △BEF; △ADG ≅ △DBE; DG:EG = 1:1. Use the two named pairs separately.",
  },
  {
    id: "rev8-34",
    group: "Revision Exercise 8",
    number: "34",
    page: 53,
    crop: crop(133, 552, 1150, 728),
    points: [
      point("A", 926, 588),
      point("B", 926, 670),
      point("C", 1124, 670),
      point("D", 1038, 634),
      point("E", 1038, 670),
    ],
    shapes: [
      { name: "ABC", vertices: ["A", "B", "C"] },
      { name: "DEC", vertices: ["D", "E", "C"] },
    ],
    prompt:
      "AB is a vertical tree 3 m high. A child DE stands 4 m from the tree. ADC and BEC are straight lines, EC = 3 m, and AB and DE are perpendicular to BC. Prove △ABC ∼ △DEC and find the child's height.",
    proof: [
      "∠ABC = ∠DEC = 90° and ∠ACB = ∠DCE (common angle). The third angles are equal, so △ABC ∼ △DEC (AAA).",
      "The correspondence is A ↔ D, B ↔ E, C ↔ C. BC = 4 + 3 = 7 m.",
      "DE/AB = EC/BC, so DE/3 = 3/7 and DE = 9/7 m.",
    ],
    result: "△ABC ∼ △DEC; the child's height is 9/7 m (about 1.286 m).",
  },
  {
    id: "rev8-35",
    group: "Revision Exercise 8",
    number: "35",
    page: 53,
    crop: crop(119, 737, 1156, 1035),
    points: [
      point("A", 845, 792),
      point("P", 845, 932),
      point("B", 1101, 774),
      point("T", 1101, 932),
      point("C", 985, 879),
      point("R", 985, 932),
      point("Q", 926, 932),
      point("S", 1069, 932),
    ],
    shapes: [
      { name: "APS", vertices: ["A", "P", "S"] },
      { name: "CRS", vertices: ["C", "R", "S"] },
      { name: "BTQ", vertices: ["B", "T", "Q"] },
      { name: "CRQ", vertices: ["C", "R", "Q"] },
    ],
    prompt:
      "A boy CR of height 1.6 m stands between vertical lamps AP and BT of heights 7 m and 8 m. Shadows SR and QR are 3 m and 2 m. ACS, BCQ and PQRST are straight lines. Find PS, QT and the distance PT between the lamps.",
    proof: [
      "Compare APS with CRS: the angles at P and R are right angles and the angle at S is shared. Thus △APS ∼ △CRS (AAA), so PS/3 = 7/1.6 and PS = 13.125 m.",
      "Compare BTQ with CRQ: the angles at T and R are right angles and the angle at Q is shared. Thus △BTQ ∼ △CRQ (AAA), so QT/2 = 8/1.6 and QT = 10 m.",
      "QS = QR + RS = 2 + 3 = 5 m. Hence PT = PS + QT − QS = 13.125 + 10 − 5 = 18.125 m.",
    ],
    result:
      "PS = 13.125 m; QT = 10 m; PT = 18.125 m. Compare APS ↔ CRS and BTQ ↔ CRQ separately.",
  },
  {
    id: "rev8-36",
    group: "Revision Exercise 8",
    number: "36",
    page: 53,
    crop: crop(133, 1031, 1155, 1247),
    points: [
      point("A", 791, 1111),
      point("B", 757, 1151),
      point("C", 745, 1213),
      point("D", 868, 1213),
      point("E", 861, 1162),
      point("P", 1011, 1060),
      point("Q", 960, 1120),
      point("R", 941, 1213),
      point("S", 1126, 1213),
      point("T", 1117, 1136),
    ],
    shapes: [
      { name: "ABCDE", vertices: ["A", "B", "C", "D", "E"] },
      { name: "PQRST", vertices: ["P", "Q", "R", "S", "T"] },
    ],
    prompt:
      "ABCDE ∼ PQRST. AB = x, BE = x + 2, CD = 8, PQ = 6, QT = 9 and RS = y. Find x and y.",
    proof: [
      "The given correspondence is A ↔ P, B ↔ Q, C ↔ R, D ↔ S, E ↔ T. The internal segment BE corresponds to QT.",
      "AB/PQ = BE/QT gives x/6 = (x + 2)/9. Hence 9x = 6x + 12 and x = 4.",
      "RS/CD = PQ/AB = 6/4, so y/8 = 6/4 and y = 12.",
    ],
    result:
      "x = 4; y = 12. These are similar pentagons; compare all five vertices.",
  },
  {
    id: "rev8-37",
    group: "Revision Exercise 8",
    number: "37",
    page: 53,
    crop: crop(133, 1256, 1153, 1476),
    points: [
      point("A", 896, 1436),
      point("B", 1066, 1436),
      point("C", 1123, 1338),
      point("D", 1065, 1289),
      point("E", 979, 1289),
      point("P", 951, 1338),
      point("Q", 980, 1363),
      point("R", 1023, 1363),
    ],
    shapes: [
      { name: "ABCDE", vertices: ["A", "B", "C", "D", "E"] },
      { name: "DEPQR", vertices: ["D", "E", "P", "Q", "R"] },
    ],
    prompt:
      "APE is a straight line, AB ∥ ED, ABCDE ∼ DEPQR and ∠EAB = 60°. Find ∠ABC, then decide whether AE ∥ RD ∥ BC.",
    proof: [
      "AB ∥ ED gives ∠DEA = 180° − 60° = 120° (interior angles). Since A, P and E are collinear, ∠DEP = 120°.",
      "ABCDE ∼ DEPQR gives B ↔ E, so ∠ABC = ∠DEP = 120°. It also gives A ↔ D, so ∠RDE = ∠EAB = 60°.",
      "∠DEA + ∠RDE = 180°, so AE ∥ RD. Also ∠EAB + ∠ABC = 180°, so AE ∥ BC. Therefore AE ∥ RD ∥ BC.",
    ],
    result:
      "∠ABC = 120°; yes, AE ∥ RD ∥ BC. The five-vertex correspondence is ABCDE ↔ DEPQR.",
  },
  {
    id: "rev8-38",
    group: "Revision Exercise 8",
    number: "38",
    page: 54,
    crop: crop(81, 105, 1110, 315),
    points: [
      point("A", 807, 135),
      point("B", 807, 248),
      point("C", 1034, 248),
      point("D", 1034, 135),
      point("E", 943, 135),
      point("F", 943, 248),
      point("G", 943, 232),
      point("H", 807, 232),
    ],
    shapes: [
      { name: "AEGH", vertices: ["A", "E", "G", "H"] },
      { name: "DCFE", vertices: ["D", "C", "F", "E"] },
    ],
    prompt:
      "Rectangular paper ABCD has BC = 20 cm and CD = 10 cm. Two similar rectangles CDEF and AEGH are cut out; ED = 8 cm. The strip BFGH is wasted. Find AH and the percentage of the original paper wasted.",
    proof: [
      "AE = AD − ED = 20 − 8 = 12 cm. Use the rotated correspondence AEGH ↔ DCFE: A ↔ D, E ↔ C, G ↔ F, H ↔ E.",
      "AH/DE = AE/DC, so AH/8 = 12/10 and AH = 9.6 cm.",
      "HB = 10 − 9.6 = 0.4 cm. Waste area = 12 × 0.4 = 4.8 cm²; original area = 20 × 10 = 200 cm². Percentage wasted = (4.8/200) × 100% = 2.4%.",
    ],
    result:
      "AH = 9.6 cm; 2.4% is wasted. Rotate one rectangle to reveal the corresponding long and short sides.",
  },
];
