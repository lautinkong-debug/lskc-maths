/**
 * Ch.16 learning content, checked against the supplied reasons summary and
 * textbook Key Notes 1–17 (printed pp.16.63–16.67).
 * Arc names in prose refer to arc lengths, not chord lengths.
 */
export type LabId =
  | "bisector"
  | "chords"
  | "centre"
  | "segment"
  | "semicircle"
  | "equal-arcs"
  | "ratios";

export type Reason = {
  id: string;
  number: string;
  label: string;
  given: string;
  conclusion: string;
  condition: string;
  memory: string;
  lab: LabId;
};

export const reasons: Reason[] = [
  {
    id: "r1", number: "16.1",
    label: "line from centre ⊥ chord bisects chord",
    given: "O is the centre; N is on chord AB; ON ⊥ AB.",
    conclusion: "AN = NB",
    condition: "The perpendicular starts at the centre. AB is not a diameter.",
    memory: "Centre + perpendicular → two equal halves.", lab: "bisector",
  },
  {
    id: "r2", number: "16.2",
    label: "line from centre to mid-pt. of chord ⊥ chord",
    given: "O is the centre; N is the mid-point of chord AB.",
    conclusion: "ON ⊥ AB",
    condition: "Join the centre to the mid-point. AB is not a diameter.",
    memory: "Centre + mid-point → perpendicular.", lab: "bisector",
  },
  {
    id: "r3", number: "16.3",
    label: "⊥ bisector of chord passes through centre",
    given: "A line is perpendicular to chord AB at its mid-point.",
    conclusion: "The centre O lies on that line.",
    condition: "Both perpendicular and bisecting are needed.",
    memory: "Perpendicular + mid-point → find the centre.", lab: "bisector",
  },
  {
    id: "r4", number: "16.4",
    label: "equal chords, equidistant from centre",
    given: "AB = CD; OM ⊥ AB and ON ⊥ CD.",
    conclusion: "OM = ON",
    condition: "Chords are in the same circle (or equal circles); distances are perpendicular.",
    memory: "Equal chords → equal distances.", lab: "chords",
  },
  {
    id: "r5", number: "16.5",
    label: "chords equidistant from centre are equal",
    given: "OM = ON; OM ⊥ AB and ON ⊥ CD.",
    conclusion: "AB = CD",
    condition: "Chords are in the same circle (or equal circles); distances are perpendicular.",
    memory: "Equal distances → equal chords.", lab: "chords",
  },
  {
    id: "r6", number: "16.6",
    label: "∠ at centre twice ∠ at ⊙ce",
    given: "A centre angle and a circumference angle stand on the same arc.",
    conclusion: "Centre angle = 2 × circumference angle",
    condition: "Use the arc not containing the circumference vertex; its centre angle may be reflex.",
    memory: "Same arc: centre is double.", lab: "centre",
  },
  {
    id: "r7", number: "16.7",
    label: "∠s in the same segment",
    given: "P and Q lie on the circle, on the same side of chord AB.",
    conclusion: "∠APB = ∠AQB",
    condition: "Both angles stand on AB; P and Q are on the circumference and are distinct from A and B.",
    memory: "Same chord + same side → equal angles.", lab: "segment",
  },
  {
    id: "r8", number: "16.8",
    label: "∠ in semi-circle",
    given: "AB is a diameter; C is on the circumference.",
    conclusion: "∠ACB = 90°",
    condition: "C is distinct from A and B. A chord merely looking horizontal is not enough.",
    memory: "Diameter given → right angle.", lab: "semicircle",
  },
  {
    id: "r9", number: "16.9",
    label: "converse of ∠ in semi-circle",
    given: "A, B and C are on the circle; ∠ACB = 90°.",
    conclusion: "AB is a diameter.",
    condition: "The right-angle vertex C must be on the circumference.",
    memory: "Right angle given → diameter.", lab: "semicircle",
  },
  {
    id: "r10", number: "16.10",
    label: "equal ∠s, equal arcs",
    given: "∠AOB = ∠COD at the centre.",
    conclusion: "The corresponding arcs AB and CD are equal.",
    condition: "Same circle or equal circles. Match each arc to its own centre angle. Equal circumference angles also give equal intercepted arcs.",
    memory: "Equal angles → equal arcs.", lab: "equal-arcs",
  },
  {
    id: "r11", number: "16.11",
    label: "equal arcs, equal ∠s",
    given: "Arcs AB and CD are equal.",
    conclusion: "Their corresponding centre angles are equal.",
    condition: "Same circle or equal circles. A major arc goes with a reflex centre angle. Equal arcs also give equal circumference angles that intercept them.",
    memory: "Equal arcs → equal angles.", lab: "equal-arcs",
  },
  {
    id: "r12", number: "16.12",
    label: "equal ∠s, equal chords",
    given: "∠AOB = ∠COD at the centre.",
    conclusion: "AB = CD",
    condition: "Same circle or equal circles; O is the centre. Equal circumference angles also give equal chords.",
    memory: "Equal angles → equal chords.", lab: "equal-arcs",
  },
  {
    id: "r13", number: "16.13",
    label: "equal chords, equal ∠s",
    given: "AB = CD",
    conclusion: "Their minor centre angles are equal.",
    condition: "Same circle or equal circles. Compare minor centre angles with minor (or reflex with reflex). Circumference angles are also equal if they intercept matching minor arcs (or matching major arcs).",
    memory: "Equal chords → equal angles.", lab: "equal-arcs",
  },
  {
    id: "r14", number: "16.14",
    label: "equal chords, equal arcs",
    given: "AB = CD",
    conclusion: "Minor arc AB = minor arc CD",
    condition: "Same circle or equal circles. Compare minor arcs with minor arcs (or major with major).",
    memory: "Equal chords → equal arcs.", lab: "equal-arcs",
  },
  {
    id: "r15", number: "16.15",
    label: "equal arcs, equal chords",
    given: "Arcs AB and CD are equal.",
    conclusion: "AB = CD",
    condition: "The arcs belong to the same circle or equal circles.",
    memory: "Equal arcs → equal chords.", lab: "equal-arcs",
  },
  {
    id: "r16", number: "16.16",
    label: "arcs prop. to ∠s at centre",
    given: "The centre angles for arcs AB and CD are θ and φ.",
    conclusion: "Arc AB : arc CD = θ : φ",
    condition: "Same circle or equal circles. Match each arc to its angle; this is not a chord ratio rule.",
    memory: "Arc ratio = centre-angle ratio.", lab: "ratios",
  },
  {
    id: "r17", number: "16.17",
    label: "arcs prop. to ∠s at ⊙ce",
    given: "Arcs AB and CD subtend circumference angles θ and φ.",
    conclusion: "Arc AB : arc CD = θ : φ",
    condition: "Same circle or equal circles. Each arc excludes its own circumference-angle vertex.",
    memory: "Arc ratio = circumference-angle ratio.", lab: "ratios",
  },
];

export type Lab = {
  id: LabId;
  title: string;
  question: string;
  prediction: string[];
  correctPrediction: number;
  hint: string;
  discovery: string;
  explanation: string;
  reasonIds: string[];
};

export const labs: Lab[] = [
  {
    id: "bisector", title: "Find the hidden mid-point",
    question: "When a line from O meets a chord at 90°, what happens to the two parts of the chord?",
    prediction: ["The two parts are equal.", "One part is always twice the other.", "Their lengths have no fixed relationship."],
    correctPrediction: 0,
    hint: "Slide N until ∠ONB is 90°. Compare AN with NB. Change the chord distance, then find 90° again.",
    discovery: "A perpendicular from the centre cuts a chord into two equal parts.",
    explanation: "Join OA and OB. Equal radii and the shared side ON make the two right-angled triangles congruent by RHS, so AN = NB. Reverse the starting information: if N is the mid-point, use SSS to show ON ⊥ AB. The perpendicular bisector also lets you locate O.",
    reasonIds: ["r1", "r2", "r3"],
  },
  {
    id: "chords", title: "The chord balance challenge",
    question: "In one circle, when two chords are equally far from O, how do their lengths compare?",
    prediction: ["The higher chord is longer.", "The chords have equal lengths.", "The chords must be diameters."],
    correctPrediction: 1,
    hint: "Distance means the perpendicular distance. Try matching the two distances, then separate them.",
    discovery: "Equal perpendicular distances give equal chords, and equal chords give equal distances.",
    explanation: "A radius, a perpendicular distance and half a chord form a right-angled triangle. With a fixed radius, the same distance gives the same half-chord by Pythagoras. Moving a chord closer to O makes it longer. Equal radii are essential when comparing different circles.",
    reasonIds: ["r4", "r5"],
  },
  {
    id: "centre", title: "Centre versus circumference",
    question: "For the same intercepted arc, how does the angle at O compare with the angle at P?",
    prediction: ["The angles are equal.", "The centre angle is always 90°.", "The centre angle is twice the circumference angle."],
    correctPrediction: 2,
    hint: "Follow the highlighted arc from A to B without passing through P. That arc selects the centre angle.",
    discovery: "The centre angle is double the circumference angle standing on the same arc.",
    explanation: "Join OP and use the isosceles triangles formed by the radii. Their equal base angles lead to the double-angle result. If P moves onto the minor arc AB, ∠APB intercepts the major arc, so the matching centre angle is reflex. Always match the arc first.",
    reasonIds: ["r6"],
  },
  {
    id: "segment", title: "Move the point, keep the angle",
    question: "P and Q are on the circumference, on the same side of chord AB. What happens to ∠APB and ∠AQB?",
    prediction: ["They stay equal.", "The angle nearer A is always larger.", "They always add up to 90°."],
    correctPrediction: 0,
    hint: "Keep A and B fixed. Compare the angles at two different points on the same arc.",
    discovery: "Angles standing on the same chord, in the same segment, are equal.",
    explanation: "Both circumference angles are half of the same centre angle, so they are equal. The condition is more than ‘same chord’: both vertices must be on the circumference and on the same side of AB. Test the other side to see why that condition matters.",
    reasonIds: ["r7"],
  },
  {
    id: "semicircle", title: "Hunt for a right angle",
    question: "If AB is a diameter, what angle does it make at any other point P on the circle?",
    prediction: ["45°", "90°", "180°"],
    correctPrediction: 1,
    hint: "A diameter makes 180° at O. Use what you discovered about centre and circumference angles.",
    discovery: "A diameter gives a right angle at the circumference. A right angle there identifies a diameter.",
    explanation: "The centre angle for a semicircle is 180°, so the circumference angle is 90°. For the reverse direction, a 90° circumference angle gives a 180° centre angle, making A, O and B collinear. Choose the reason according to which fact is GIVEN.",
    reasonIds: ["r8", "r9"],
  },
  {
    id: "equal-arcs", title: "Make three things match",
    question: "In one circle, if two minor centre angles are equal, which other measurements match?",
    prediction: ["Only the chords.", "Only the arcs.", "Both the chords and the corresponding arcs."],
    correctPrediction: 2,
    hint: "Match the two centre angles. Read the chord lengths and arc lengths, then change both angles together.",
    discovery: "Equal minor centre angles, equal chords and equal minor arcs go together.",
    explanation: "Two triangles made from equal radii and equal included angles are congruent by SAS, so their chords match. The equal angles also take equal fractions of the same circumference, so their arcs match. Each direction has its own reason: say what you HAVE first, then what you GET.",
    reasonIds: ["r10", "r11", "r12", "r13", "r14", "r15"],
  },
  {
    id: "ratios", title: "Double the angle: what doubles?",
    question: "In one circle, when a centre angle doubles, which length must also double?",
    prediction: ["Its corresponding arc length.", "Its chord length.", "Both the arc length and chord length."],
    correctPrediction: 0,
    hint: "Try 60° and 120°. Compare the arc ratio with the chord ratio.",
    discovery: "Arcs keep the ratio of their centre angles and their circumference angles. Chords do not generally keep that ratio.",
    explanation: "Arc length = (centre angle ÷ 360°) × circumference. In one circle, this makes arc length proportional to its centre angle. Each circumference angle is half its matching centre angle; halving both angles preserves their ratio. A chord is a straight shortcut, so doubling the angle does not generally double the chord.",
    reasonIds: ["r16", "r17"],
  },
];

export type Trap = {
  id: string;
  claim: string;
  valid: boolean;
  explanation: string;
  lab: LabId;
};

export const traps: Trap[] = [
  { id: "t1", claim: "Any line perpendicular to a chord cuts it into equal halves.", valid: false, explanation: "The line must pass through the centre. A perpendicular through a different point of the chord need not bisect it.", lab: "bisector" },
  { id: "t2", claim: "A line through a chord’s mid-point must pass through the centre.", valid: false, explanation: "Being a bisector is not enough. The perpendicular bisector passes through the centre.", lab: "bisector" },
  { id: "t3", claim: "For a non-diameter chord AB, joining the centre to its mid-point gives a perpendicular to AB.", valid: true, explanation: "This is 16.2. The GIVEN is the mid-point; the conclusion is perpendicular. Keep that direction in the reason.", lab: "bisector" },
  { id: "t4", claim: "Two equal sloping segments from O to two chords prove the chords have equal lengths.", valid: false, explanation: "Distances to chords must be measured perpendicularly. Equal sloping segments do not establish equal perpendicular distances.", lab: "chords" },
  { id: "t5", claim: "In one circle, chords at the same perpendicular distance from O have equal lengths.", valid: true, explanation: "The fixed radius and equal distances give equal half-chords by Pythagoras. This is 16.5.", lab: "chords" },
  { id: "t6", claim: "If ∠APB = 120° at the circumference, the matching centre angle is the reflex angle 240°.", valid: true, explanation: "The same intercepted arc is a major arc. Its centre angle is 2 × 120° = 240°, not the smaller 120° angle between OA and OB.", lab: "centre" },
  { id: "t7", claim: "Angles standing on the same chord are always equal, even when their vertices are on opposite sides of it.", valid: false, explanation: "The equal-angle reason needs the same segment. Opposite-side angles intercept complementary arcs and generally differ; a diameter is a special case.", lab: "segment" },
  { id: "t8", claim: "P and Q are on the same side of AB, so ∠APB = ∠AQB even if Q is inside the circle.", valid: false, explanation: "Both vertices must lie on the circumference. Merely being on the same side of AB is not enough.", lab: "segment" },
  { id: "t9", claim: "When AB is GIVEN as a diameter, use ‘converse of ∠ in semi-circle’ to conclude ∠ACB = 90°.", valid: false, explanation: "Use ‘∠ in semi-circle’. The converse starts with a right angle at the circumference and concludes that AB is a diameter.", lab: "semicircle" },
  { id: "t10", claim: "If A, B and C lie on a circle and ∠ACB = 90°, then AB is a diameter.", valid: true, explanation: "This is the converse of the angle-in-a-semicircle theorem. The right angle is GIVEN, so the conclusion is a diameter.", lab: "semicircle" },
  { id: "t11", claim: "Equal 60° centre angles in circles of radii 3 cm and 6 cm cut off equal arc lengths.", valid: false, explanation: "The circles have different radii. Their 60° arcs take the same fraction of each circumference, but the larger circle’s arc is twice as long.", lab: "equal-arcs" },
  { id: "t12", claim: "In one circle, equal chords cut off equal minor arcs.", valid: true, explanation: "This is 16.14. Match minor with minor (or major with major); one chord has both a minor and a major arc.", lab: "equal-arcs" },
  { id: "t13", claim: "In one circle, centre angles 50° and 100° give chord lengths in the ratio 1 : 2.", valid: false, explanation: "The ratio 1 : 2 applies to their arcs, not their chords. A straight chord does not grow in direct proportion to the angle.", lab: "ratios" },
  { id: "t14", claim: "In one circle, arcs subtending circumference angles 25° and 75° have lengths in the ratio 1 : 3.", valid: true, explanation: "Match each arc to its own circumference angle. Then arc ratio = 25 : 75 = 1 : 3 by 16.17.", lab: "ratios" },
  { id: "t15", claim: "For a major arc of 250°, use 110° as its matching centre angle.", valid: false, explanation: "The matching centre angle traces the chosen arc. A 250° major arc goes with a reflex centre angle of 250°, not the remaining 110°.", lab: "centre" },
];

export type ReasonQuestion = {
  id: string;
  given: string;
  statement: string;
  reasonId: string;
  distractorIds: string[];
  explanation: string;
};

export const reasonQuestions: ReasonQuestion[] = [
  {
    id: "q1", given: "O is the centre. N lies on non-diameter chord AB, ON ⊥ AB and AB = 18 cm.",
    statement: "AN = NB = 9 cm", reasonId: "r1", distractorIds: ["r2", "r3", "r5"],
    explanation: "You HAVE a perpendicular from the centre and GET equal halves. Do not reverse the reason.",
  },
  {
    id: "q2", given: "O is the centre. N is on non-diameter chord AB and AN = NB.",
    statement: "ON ⊥ AB", reasonId: "r2", distractorIds: ["r1", "r3", "r4"],
    explanation: "You HAVE the mid-point and GET a perpendicular. This is 16.2, the reverse of 16.1.",
  },
  {
    id: "q3", given: "A line ℓ meets chord AB at N, with AN = NB and ℓ ⊥ AB.",
    statement: "The centre O lies on ℓ.", reasonId: "r3", distractorIds: ["r1", "r2", "r5"],
    explanation: "You HAVE a perpendicular bisector and GET the location of the centre.",
  },
  {
    id: "q4", given: "In a circle centred at O, AB = CD, OM ⊥ AB, ON ⊥ CD and OM = 4 cm.",
    statement: "ON = OM = 4 cm", reasonId: "r4", distractorIds: ["r5", "r13", "r14"],
    explanation: "The GIVEN is equal chords; the required conclusion is equal perpendicular distances.",
  },
  {
    id: "q5", given: "In a circle centred at O, OM ⊥ AB, ON ⊥ CD, OM = ON and AB = 12 cm.",
    statement: "CD = AB = 12 cm", reasonId: "r5", distractorIds: ["r4", "r12", "r15"],
    explanation: "The GIVEN is equal perpendicular distances; the required conclusion is equal chords.",
  },
  {
    id: "q6", given: "O is the centre. P is on the major arc AB and ∠APB = 38°.",
    statement: "Minor ∠AOB = 2 × 38° = 76°", reasonId: "r6", distractorIds: ["r7", "r8", "r16"],
    explanation: "Both angles intercept minor arc AB. The centre angle is twice the circumference angle.",
  },
  {
    id: "q7", given: "A, B, P and Q lie on one circle. P and Q are on the same side of AB; ∠APB = 47°.",
    statement: "∠AQB = ∠APB = 47°", reasonId: "r7", distractorIds: ["r6", "r8", "r13"],
    explanation: "Both circumference angles stand on the same chord AB in the same segment.",
  },
  {
    id: "q8", given: "AB is a diameter and C is another point on the circumference.",
    statement: "∠ACB = 90°", reasonId: "r8", distractorIds: ["r9", "r7", "r2"],
    explanation: "Diameter is the GIVEN; right angle is the conclusion. Use the theorem, not its converse.",
  },
  {
    id: "q9", given: "A, B and C lie on a circle and ∠ACB = 90°.",
    statement: "AB is a diameter.", reasonId: "r9", distractorIds: ["r8", "r3", "r7"],
    explanation: "Right angle is the GIVEN; diameter is the conclusion. That direction requires the converse.",
  },
  {
    id: "q10", given: "In a circle centred at O, minor ∠AOB = minor ∠COD = 64°.",
    statement: "Minor arc AB = minor arc CD", reasonId: "r10", distractorIds: ["r11", "r12", "r14"],
    explanation: "Read the direction: equal ANGLES are given, and equal ARCS are concluded.",
  },
  {
    id: "q11", given: "In a circle centred at O, minor arc AB = minor arc CD.",
    statement: "Minor ∠AOB = minor ∠COD", reasonId: "r11", distractorIds: ["r10", "r13", "r15"],
    explanation: "Read the direction: equal ARCS are given, and equal ANGLES are concluded.",
  },
  {
    id: "q12", given: "In a circle centred at O, minor ∠AOB = minor ∠COD and AB = 7 cm.",
    statement: "CD = AB = 7 cm", reasonId: "r12", distractorIds: ["r13", "r10", "r15"],
    explanation: "Equal ANGLES lead directly to equal CHORDS. There is no given arc equality to use.",
  },
  {
    id: "q13", given: "In a circle centred at O, AB = CD and minor ∠AOB = 72°.",
    statement: "Minor ∠COD = minor ∠AOB = 72°", reasonId: "r13", distractorIds: ["r12", "r11", "r14"],
    explanation: "Equal CHORDS are given and equal ANGLES are concluded. Compare the two minor centre angles.",
  },
  {
    id: "q14", given: "AB and CD are equal chords of the same circle.",
    statement: "Minor arc AB = minor arc CD", reasonId: "r14", distractorIds: ["r15", "r10", "r13"],
    explanation: "Equal CHORDS lead directly to equal ARCS. Both arcs are explicitly minor.",
  },
  {
    id: "q15", given: "In one circle, minor arc AB = minor arc CD and AB = 11 cm.",
    statement: "CD = AB = 11 cm", reasonId: "r15", distractorIds: ["r14", "r12", "r11"],
    explanation: "Equal ARCS are given and equal CHORDS are concluded.",
  },
  {
    id: "q16", given: "In a circle centred at O, minor ∠AOB = 40° and minor ∠COD = 100°.",
    statement: "Minor arc AB : minor arc CD = 40 : 100 = 2 : 5", reasonId: "r16", distractorIds: ["r17", "r10", "r12"],
    explanation: "The given angles are at the CENTRE. Arc lengths keep their ratio; chord lengths need not.",
  },
  {
    id: "q17", given: "In one circle, arc AB not containing P subtends ∠APB = 24°. Arc CD not containing Q subtends ∠CQD = 60°.",
    statement: "Arc AB : arc CD = 24 : 60 = 2 : 5", reasonId: "r17", distractorIds: ["r16", "r6", "r11"],
    explanation: "The given angles are at the CIRCUMFERENCE. Each stated arc matches its own angle.",
  },
  {
    id: "q18", given: "O is the centre. P is on minor arc AB and ∠APB = 112°.",
    statement: "Reflex ∠AOB = 2 × 112° = 224°", reasonId: "r6", distractorIds: ["r7", "r8", "r16"],
    explanation: "P lies on the minor arc, so ∠APB intercepts the major arc. Its matching centre angle is reflex.",
  },
  {
    id: "q19", given: "Arcs AB and CD belong to equal circles and subtend equal minor angles at their respective centres.",
    statement: "Minor arc AB = minor arc CD", reasonId: "r10", distractorIds: ["r11", "r14", "r12"],
    explanation: "Equal circles have the same radius, so equal centre angles cut off equal arc lengths. Different-sized circles would not support this conclusion.",
  },
  {
    id: "q20", given: "A, B, C, D, P and Q lie on one circle. ∠APB = ∠CQD = 32°.",
    statement: "Arc AB not containing P = arc CD not containing Q", reasonId: "r10", distractorIds: ["r11", "r12", "r14"],
    explanation: "Equal circumference angles give equal intercepted arcs too. Match each arc to its own vertex; the intercepted arc excludes that vertex.",
  },
  {
    id: "q21", given: "In one circle, equal arcs AB and CD do not contain P and Q respectively. P and Q are on the circumference.",
    statement: "∠APB = ∠CQD", reasonId: "r11", distractorIds: ["r10", "r13", "r15"],
    explanation: "Equal arcs give equal corresponding circumference angles as well as equal centre angles. This is the equal case of the circumference-angle ratio rule.",
  },
  {
    id: "q22", given: "A, B, C, D, P and Q lie on one circle. ∠APB = ∠CQD = 41° and AB = 8 cm.",
    statement: "CD = AB = 8 cm", reasonId: "r12", distractorIds: ["r13", "r10", "r15"],
    explanation: "Equal circumference angles intercept equal arcs, which cut off equal chords. The short reason ‘equal ∠s, equal chords’ also applies here.",
  },
  {
    id: "q23", given: "AB = CD in one circle. P lies on major arc AB and Q lies on major arc CD; ∠APB = 36°.",
    statement: "∠CQD = ∠APB = 36°", reasonId: "r13", distractorIds: ["r12", "r11", "r14"],
    explanation: "Both circumference angles intercept matching minor arcs, so equal chords give equal angles. A vertex on the wrong side would instead intercept a major arc.",
  },
];
