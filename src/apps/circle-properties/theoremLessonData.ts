// Reason numbers and directions follow Book 5A, Key Notes 3–17 (pp. 16.63–16.67).
// Diagram labels match reasonFlow. The check and written case are separate problems.
export type GuidedReasonId =
  | "r3"
  | "r4"
  | "r5"
  | "r6"
  | "r7"
  | "r8"
  | "r9"
  | "r10"
  | "r11"
  | "r12"
  | "r13"
  | "r14"
  | "r15"
  | "r16"
  | "r17";

type Triple = [string, string, string];
type Choice = { options: Triple; answer: 0 | 1 | 2; feedback: Triple };
type Case = Choice & { given: string; target: string };
type Term = { term: string; meaning: string; marks?: string[] };
export type TheoremLesson = {
  title: string;
  terms: Term[];
  investigate: string;
  prediction: Choice & { question: string };
  explanation: string;
  /** Options are canonical reason IDs; Write it options are complete conclusion lines. */
  check: Case;
  write: Case;
};

const chord: Term = {
  term: "Chord",
  meaning: "Trace the straight segment joining A and B on the circle.",
  marks: ["chord-AB"],
};
const perpendicularDistance: Term = {
  term: "Distance from a point to a chord",
  meaning:
    "Trace OM from O to AB. The square at M tells you this is the shortest distance.",
  marks: ["distance-OM", "right-angle-M"],
};
const centreAngle: Term = {
  term: "Angle at the centre",
  meaning: "Trace AO, then OB. The middle letter in ∠AOB names the vertex O.",
};
const minorArc: Term = {
  term: "Minor arc",
  meaning: "Follow the shorter curved path from A to B around the circle.",
};
const circumferenceAngle: Term = {
  term: "Angle at the circumference",
  meaning: "Trace AP, then PB. The vertex P of ∠APB is on the circle.",
  marks: ["PA", "PB"],
};
const diameter: Term = {
  term: "Diameter",
  meaning: "A chord through the centre. Both ends are on the circle.",
};
const circleSize: Term = {
  term: "Equal circles",
  meaning:
    "Two circles are equal in size when their radii are equal. The diagram uses one circle.",
};
const ratio: Term = {
  term: "Arc-length ratio",
  meaning:
    "For arc AB ÷ arc CD, use the curved length from A to B first and the curved length from C to D second.",
};

/** The two earlier directions reappear when a pupil compares all three chord reasons. */
export const chordComparisonChecks: Record<"r1" | "r2", Case> = {
  r1: {
    given:
      "O is the centre. The line from O meets a non-diameter chord AB at N at a right angle.",
    target: "Prove that N divides chord AB into two equal lengths.",
    options: ["r3", "r1", "r2"],
    answer: 1,
    feedback: [
      "16.3 locates the centre after the mid-point is known.",
      "The line from O is perpendicular to the chord. The equal halves follow.",
      "16.2 would require N to be given as the mid-point.",
    ],
  },
  r2: {
    given: "O is the centre. N lies on non-diameter chord AB and AN = NB.",
    target: "Prove that ON makes a right angle with AB.",
    options: ["r1", "r3", "r2"],
    answer: 2,
    feedback: [
      "16.1 starts with a right angle. This question asks you to prove it.",
      "16.3 requires the perpendicular at the mid-point as a given.",
      "The equal halves give a mid-point. Joining it to the centre gives the perpendicular.",
    ],
  },
};

export const theoremLessons: Record<GuidedReasonId, TheoremLesson> = {
  r3: {
    title: "Locate the centre",
    terms: [
      chord,
      {
        term: "Mid-point",
        meaning: "The matching ticks on AN and NB place N halfway along AB.",
        marks: ["equal-AN", "equal-NB"],
      },
      {
        term: "Perpendicular bisector",
        meaning:
          "Line ℓ crosses AB at its mid-point and makes a right angle there.",
        marks: ["line-ell", "right-angle-N"],
      },
    ],
    investigate:
      "Drag B to tilt the chord. Follow the ticks and the square at N. Before showing O, point to where you expect the centre to lie.",
    prediction: {
      question: "With both marks at N, where must the centre lie?",
      options: ["At N", "Somewhere on line ℓ", "On chord AB"],
      answer: 1,
      feedback: [
        "N is the mid-point of this chord. The centre can be some distance from it.",
        "Yes. One perpendicular bisector tells you a line on which to look for O.",
        "A chord through O would be a diameter. Try a short chord near the edge.",
      ],
    },
    explanation:
      "OA and OB are radii, so O is equally far from A and B. The points equally far from A and B form their perpendicular bisector.",
    check: {
      given:
        "N is the mid-point of chord AB. A line through N meets AB at 90°.",
      target: "Justify that the centre lies on this line.",
      options: ["r1", "r3", "r2"],
      answer: 1,
      feedback: [
        "16.1 starts with a line from the centre. Here you are still locating the centre.",
        "Both the equal halves and the right angle are given. The centre's position follows.",
        "16.2 finds a right angle after joining O to the mid-point. The right angle is already given here.",
      ],
    },
    write: {
      given:
        "Two non-parallel chords of one circle have perpendicular bisectors meeting at P.",
      target: "What can you write about P?",
      options: [
        "P is the mid-point of both chords.",
        "P lies on the circumference.",
        "P is the centre of the circle.",
      ],
      answer: 2,
      feedback: [
        "Each mid-point is where its own chord meets its bisector.",
        "Each bisector meets the circumference twice. Follow the point common to both bisectors.",
        "The centre lies on both perpendicular bisectors. P is their only intersection.",
      ],
    },
  },
  r4: {
    title: "Compare the distances",
    terms: [chord, perpendicularDistance, circleSize],
    investigate:
      "Move A to make both chords shorter, then longer. Put a finger at each right-angle mark. Which two distances should you compare?",
    prediction: {
      question: "AB and CD stay equal. What must happen to OM and ON?",
      options: [
        "OM = ON",
        "OM = ½AB",
        "OM and ON must lie on the same straight line",
      ],
      answer: 0,
      feedback: [
        "Yes. Measure from O at right angles to each chord.",
        "Half a chord runs along the chord. OM measures away from it.",
        "The chords can tilt independently. The comparison is about lengths.",
      ],
    },
    explanation:
      "The perpendiculars halve the chords. Right triangles OMA and ONC have equal radii as hypotenuses and equal half-chords. By Pythagoras, OM and ON have equal lengths.",
    check: {
      given:
        "AB = CD in a circle with centre O. OM and ON meet the two chords at right angles.",
      target: "Justify OM = ON.",
      options: ["r5", "r2", "r4"],
      answer: 2,
      feedback: [
        "16.5 starts with equal distances. Those are the target here.",
        "16.2 establishes a perpendicular through a mid-point. Both perpendiculars are already given.",
        "The matching chord lengths are given. Compare their perpendicular distances from O.",
      ],
    },
    write: {
      given:
        "Equal chords AB and CD belong to one circle with centre O. OM ⊥ AB at M, ON ⊥ CD at N and OM = 3.5 cm.",
      target: "Find the distance from O to CD.",
      options: ["ON = 7 cm", "ON = OM = 3.5 cm", "CD = OM = 3.5 cm"],
      answer: 1,
      feedback: [
        "Doubling a half-chord gives a chord length. OM is a perpendicular distance.",
        "ON is the required distance. The equal chords give ON = OM.",
        "CD is measured along the chord. The required distance ends at N.",
      ],
    },
  },
  r5: {
    title: "Compare the chords",
    terms: [perpendicularDistance, chord, circleSize],
    investigate:
      "Drag M towards O and then away. OM and ON stay equal. Predict how the two straight chords will compare in each position.",
    prediction: {
      question:
        "With equal perpendicular distances from O, which equality must hold?",
      options: ["AB = OM", "AB = 2 × ON", "AB = CD"],
      answer: 2,
      feedback: [
        "AB is a chord. Look for the other chord at the same distance from O.",
        "ON is measured across the gap to CD. Doubling this gap does not give AB.",
        "Yes. Tilting one of the chords also preserves this conclusion.",
      ],
    },
    explanation:
      "The perpendiculars bisect the chords. With equal radii and equal perpendicular distances, Pythagoras gives equal half-chords. Doubling each half gives AB = CD.",
    check: {
      given:
        "The perpendicular distances from the centre of a circle to chords AB and CD are both 4 cm.",
      target: "Establish that the two chords have equal lengths.",
      options: ["r5", "r4", "r1"],
      answer: 0,
      feedback: [
        "The equal distances are known first. They give equal chord lengths.",
        "16.4 would need equal chords as its starting fact.",
        "16.1 gives two equal halves of one chord. Here the target compares two chords.",
      ],
    },
    write: {
      given:
        "AB and CD are chords of one circle. Their perpendicular distances from its centre are equal. AB = 13 cm.",
      target: "Find CD.",
      options: ["CD = AB = 13 cm", "CD = 6.5 cm", "CD = 26 cm"],
      answer: 0,
      feedback: [
        "Both distances are equal, so the whole chords have the same length.",
        "6.5 cm is half of AB. The question asks for a whole chord.",
        "13 cm already measures the whole chord AB.",
      ],
    },
  },
  r6: {
    title: "Follow one arc",
    terms: [
      circumferenceAngle,
      { ...centreAngle, marks: ["OA", "OB"] },
      {
        term: "Intercepted arc",
        meaning:
          "Follow arc AB between the two arms of ∠APB, along the part of the circle that leaves out P.",
        marks: ["same-arc-AB"],
      },
    ],
    investigate:
      "Drag P along its arc while A and B stay fixed. Trace the highlighted arc with your finger, then trace the angle at O that turns through that arc.",
    prediction: {
      question:
        "∠APB is θ. How large is the centre angle following the same arc?",
      options: ["θ", "2θ", "½θ"],
      answer: 1,
      feedback: [
        "Equality applies to two circumference angles in the same segment. One vertex here is O.",
        "Yes. For a major intercepted arc, measure the reflex turn at O.",
        "The circumference angle is the smaller of the two matching angles.",
      ],
    },
    explanation:
      "Extend PO beyond O. The radii form isosceles triangles with vertex O. In each triangle the exterior angle at O is twice a base angle. Combining the two relations gives the angle on the marked arc.",
    check: {
      given:
        "∠APB = 37° on the circumference. The minor angle at centre O stands on the same arc AB.",
      target: "Justify the step ∠AOB = 2 × 37°.",
      options: ["r7", "r16", "r6"],
      answer: 2,
      feedback: [
        "16.7 compares two angles at the circumference. Check the middle letter of ∠AOB.",
        "16.16 compares two arcs and two centre angles. This question follows one arc.",
        "O and P see the same arc from different kinds of vertex.",
      ],
    },
    write: {
      given:
        "A, B and P lie on a circle with centre O. ∠APB = 112° and intercepts the major arc AB.",
      target: "Find the centre angle standing on that major arc.",
      options: [
        "Minor ∠AOB = 112°",
        "Reflex ∠AOB = 56°",
        "Reflex ∠AOB = 2 × 112° = 224°",
      ],
      answer: 2,
      feedback: [
        "A major arc goes with the reflex turn at O.",
        "Halving gives a smaller angle. This calculation goes from the circumference to the centre.",
        "The matching turn is reflex. Twice 112° gives 224°.",
      ],
    },
  },
  r7: {
    title: "Move along one segment",
    terms: [
      chord,
      circumferenceAngle,
      {
        term: "Same segment",
        meaning:
          "P and Q lie on the circumference on the same side of the line through AB.",
        marks: ["chord-AB"],
      },
    ],
    investigate:
      "Keep A and B fixed. Drag Q towards A, then towards B on its allowed arc. Trace both angles back to their endpoints.",
    prediction: {
      question: "What happens to ∠AQB as Q moves on the same arc as P?",
      options: [
        "It remains equal to ∠APB.",
        "It grows as Q gets nearer to B.",
        "It is twice ∠APB.",
      ],
      answer: 0,
      feedback: [
        "Yes. Both vertices still see chord AB from the same segment.",
        "The arms change length. Check which endpoints both angles still see.",
        "Both vertices are on the circumference. The doubling rule needs one vertex at O.",
      ],
    },
    explanation:
      "The two angles intercept the same arc AB. Each is half the centre angle on that arc, so the two angles are equal.",
    check: {
      given:
        "P and Q lie on the circumference on the same side of chord AB. ∠APB = 41°.",
      target: "Explain why ∠AQB = 41°.",
      options: ["r6", "r7", "r8"],
      answer: 1,
      feedback: [
        "16.6 needs a centre angle. The two vertices here are P and Q.",
        "Both angles stand on AB from vertices in the same segment.",
        "16.8 needs a diameter. AB is given only as a chord.",
      ],
    },
    write: {
      given:
        "A, B, C and D lie on one circle. C and D are on the same side of AB. ∠ACB = 53°.",
      target: "Find ∠ADB.",
      options: ["∠ADB = 106°", "∠ADB = ∠ACB = 53°", "∠ADB = 127°"],
      answer: 1,
      feedback: [
        "D is a point on the circumference. Doubling would give the matching centre angle.",
        "Both angles stand on AB from the same side of the chord.",
        "127° would apply if C and D stood on opposite sides of AB.",
      ],
    },
  },
  r8: {
    title: "Start with a diameter",
    terms: [
      { ...diameter, marks: ["diameter-AB"] },
      {
        term: "Semicircle",
        meaning:
          "Either half of the circumference between the endpoints of a diameter.",
      },
      {
        term: "Angle standing on AB",
        meaning: "Follow CA and CB to find the angle at C.",
        marks: ["CA", "CB"],
      },
    ],
    investigate:
      "Drag C close to A. Then move C towards B. The triangle becomes narrow, but AB still passes through O. Predict what happens at C.",
    prediction: {
      question: "As C moves along the semicircle, which statement stays true?",
      options: ["CA = CB", "∠ACB becomes smaller near A.", "∠ACB = 90°"],
      answer: 2,
      feedback: [
        "Move C away from the top of the arc. The two sides can have different lengths.",
        "One side gets shorter. Trace the turn between CA and CB.",
        "Yes. The angle opposite the diameter stays a right angle.",
      ],
    },
    explanation:
      "A diameter makes a straight angle of 180° at O. The circumference angle intercepting that semicircle is half of 180°.",
    check: {
      given: "AB is a diameter. C is a different point on the circumference.",
      target: "Prove AC ⊥ BC.",
      options: ["r8", "r9", "r2"],
      answer: 0,
      feedback: [
        "A given diameter gives a right angle at C.",
        "The converse starts with a known right angle at C.",
        "16.2 needs the mid-point of a chord. C is on the circumference.",
      ],
    },
    write: {
      given:
        "BC is a diameter. A lies on the circle and is distinct from B and C.",
      target: "Write the right-angle statement.",
      options: ["∠BAC = 90°", "∠ABC = 90°", "∠BCA = 90°"],
      answer: 0,
      feedback: [
        "A is opposite diameter BC. It is the middle letter in ∠BAC.",
        "B is an endpoint of the diameter. Look at the third vertex.",
        "C is an endpoint of the diameter. The angle standing on BC has its vertex at A.",
      ],
    },
  },
  r9: {
    title: "Start with a right angle",
    terms: [
      {
        term: "Right angle",
        meaning: "The square at C gives ∠ACB = 90° before you know the centre.",
        marks: ["right-angle-C"],
      },
      chord,
      diameter,
    ],
    investigate:
      "Drag C and watch the square move with it. Find the chord opposite that square. Predict where its line will pass when the centre is revealed.",
    prediction: {
      question: "Which segment must pass through the centre when ∠ACB = 90°?",
      options: ["AC", "AB", "BC"],
      answer: 1,
      feedback: [
        "AC is one arm of the right angle. Look across from its vertex C.",
        "Yes. AB joins the endpoints seen from the right angle at C.",
        "BC ends at the right-angle vertex. Trace the side opposite C.",
      ],
    },
    explanation:
      "The centre angle on the arc intercepted by ∠ACB is twice 90°, hence 180°. A, O and B lie on one straight line.",
    check: {
      given: "Triangle ABC is inscribed in a circle and AC ⊥ BC.",
      target: "Prove that AB is a diameter.",
      options: ["r8", "r3", "r9"],
      answer: 2,
      feedback: [
        "16.8 would require AB to be known as a diameter at the start.",
        "A perpendicular bisector needs a mid-point as well as a perpendicular.",
        "The right angle is at C on the circumference. Its opposite chord is AB.",
      ],
    },
    write: {
      given: "A, B and C lie on a circle. ∠ABC = 90°.",
      target: "Identify the diameter.",
      options: ["AB is a diameter.", "BC is a diameter.", "AC is a diameter."],
      answer: 2,
      feedback: [
        "B is the right-angle vertex. The diameter joins the other two points.",
        "BC is an arm of the right angle. Find the opposite side.",
        "The right angle is at B on the circumference, so its opposite side AC is a diameter.",
      ],
    },
  },
  r10: {
    title: "From angles to a curved path",
    terms: [{ ...centreAngle, marks: ["angle-AOB"] }, minorArc, circleSize],
    investigate:
      "Drag B to open the two marked angles together. Trace the two shorter curved paths cut off by their arms.",
    prediction: {
      question:
        "The two minor centre angles stay equal. How do their minor arcs compare?",
      options: [
        "Their lengths can differ if one arc is higher.",
        "The lengths of the two minor arcs are equal.",
        "Each minor arc is half the circumference.",
      ],
      answer: 1,
      feedback: [
        "Turning the diagram changes its orientation. The angles and the radius determine arc length.",
        "Yes. Equal turns at O cut off equal lengths along this circumference.",
        "Half the circumference requires a 180° turn. Try a much smaller turn.",
      ],
    },
    explanation:
      "Each marked angle sweeps the same fraction of a full turn at O. The corresponding arcs take the same fraction of this circle's circumference, so they are equal in length.",
    check: {
      given:
        "O is the centre of a circle and the minor angles ∠AOB and ∠COD are equal.",
      target: "Compare the lengths of minor arc AB and minor arc CD.",
      options: ["r11", "r12", "r10"],
      answer: 2,
      feedback: [
        "16.11 starts with equal arcs. Arc lengths are what you need to find.",
        "16.12 concludes that the straight chords are equal. Trace the curved target.",
        "Start with the equal centre angles and conclude that their matching arcs are equal.",
      ],
    },
    write: {
      given:
        "In one circle with centre O, ∠AOB = ∠COD = 84°. Minor arc AB has length 7.5 cm.",
      target: "Find the length of minor arc CD.",
      options: [
        "Minor arc CD = minor arc AB = 7.5 cm",
        "CD = 7.5 cm",
        "Minor arc CD = 15 cm",
      ],
      answer: 0,
      feedback: [
        "The same angle at O cuts off the same length along the circle.",
        "CD without the arc symbol is the straight chord. The given 7.5 cm is measured along the circle.",
        "Both angles measure 84°. Their arcs take equal fractions of the circumference.",
      ],
    },
  },
  r11: {
    title: "From arcs to a turn",
    terms: [{ ...minorArc, marks: ["arc-AB"] }, centreAngle, circleSize],
    investigate:
      "Follow the two marked arcs along the circumference. Drag A to shorten or lengthen them together. For each arc, trace the radii to its endpoints.",
    prediction: {
      question:
        "The two minor arcs have the same length. Which angles must be equal?",
      options: [
        "The minor ∠AOB and the reflex ∠COD",
        "Both minor centre angles must equal 90°.",
        "The minor ∠AOB and the minor ∠COD",
      ],
      answer: 2,
      feedback: [
        "A reflex turn follows the major arc. Both marked arcs here are minor.",
        "Equal arc lengths fix a relationship between two angles. Their common size can change.",
        "Yes. The two minor turns at O sweep out the two equal minor arcs.",
      ],
    },
    explanation:
      "Equal minor arcs take equal fractions of the same circumference. Their centre angles therefore take equal fractions of a full turn.",
    check: {
      given:
        "The minor arcs AB and CD of a circle with centre O both have length 6 cm.",
      target: "Prove that the minor angles ∠AOB and ∠COD are equal.",
      options: ["r11", "r15", "r10"],
      answer: 0,
      feedback: [
        "The known quantities are arc lengths. The targets are the centre angles.",
        "16.15 reaches equal straight chords. Look at the middle letter of each target angle.",
        "16.10 starts with equal angles and works in the reverse direction.",
      ],
    },
    write: {
      given:
        "In one circle, the circumference angles ∠APB and ∠CQD intercept equal minor arcs AB and CD respectively. ∠CQD = 64°.",
      target: "Find ∠APB.",
      options: ["∠APB = 32°", "∠APB = ∠CQD = 64°", "∠APB = 128°"],
      answer: 1,
      feedback: [
        "Halving connects a centre angle with a circumference angle. Both vertices here are on the circumference.",
        "Equal intercepted arcs give equal circumference angles. Each is half of its matching centre angle.",
        "128° is the centre angle for this arc. The required angle is at P.",
      ],
    },
  },
  r12: {
    title: "From angles to a straight span",
    terms: [{ ...centreAngle, marks: ["angle-AOB"] }, chord, circleSize],
    investigate:
      "Drag B to change the two equal centre angles. Now trace the straight segments AB and CD with your finger. Predict how the spans compare.",
    prediction: {
      question:
        "When the minor angles at O match, which statement about the straight chords follows?",
      options: [
        "AB = CD",
        "AB and CD must be parallel.",
        "Both chords pass through O.",
      ],
      answer: 0,
      feedback: [
        "Yes. Equal turns at the centre give equal straight spans in this circle.",
        "Rotate one chord about O. Orientation can change while its length stays fixed.",
        "A chord through O has a centre angle of 180°. The two matching angles can be smaller.",
      ],
    },
    explanation:
      "In triangles AOB and COD, the corresponding radii are equal and so are the included angles. The triangles are congruent by SAS, giving AB = CD.",
    check: {
      given:
        "In a circle with centre O, the minor angles ∠AOB and ∠COD both measure 76°.",
      target: "Prove chord AB equals chord CD.",
      options: ["r10", "r12", "r13"],
      answer: 1,
      feedback: [
        "16.10 gives equal curved lengths. This target asks about straight segments.",
        "The given angles lead directly to the opposite chord lengths.",
        "16.13 takes equal chords as the given fact.",
      ],
    },
    write: {
      given:
        "O is the centre of one circle. The minor angles ∠AOB and ∠COD are equal and chord CD = 9 cm.",
      target: "Find chord AB.",
      options: ["Minor arc AB = 9 cm", "AB = 4.5 cm", "AB = CD = 9 cm"],
      answer: 2,
      feedback: [
        "The known 9 cm is a straight length. Keep the curved and straight measures separate.",
        "CD already measures a whole chord. Compare it with the whole chord AB.",
        "AB and CD are the chords cut off by the equal centre angles.",
      ],
    },
  },
  r13: {
    title: "From straight spans to turns",
    terms: [chord, centreAngle, circleSize],
    investigate:
      "Trace the matching chord marks, then drag A to change their common length. Look from O towards the ends of each chord and compare the smaller turns.",
    prediction: {
      question:
        "AB and CD stay equal. How do their minor centre angles compare?",
      options: [
        "They always add up to 180°.",
        "∠AOB = ∠COD",
        "∠AOB = 2 × ∠COD",
      ],
      answer: 1,
      feedback: [
        "Try two short equal chords. Each can cut off a small angle.",
        "Yes. Compare the same kind of turn at O for both chords.",
        "Both angles are at O. The factor of two applies to a centre angle and a circumference angle.",
      ],
    },
    explanation:
      "Triangles AOB and COD have equal chords and two pairs of equal radii. They are congruent by SSS, so the angles opposite the equal chords are equal.",
    check: {
      given: "AB and CD are equal chords in a circle with centre O.",
      target: "Compare the minor angles at O opposite the chords.",
      options: ["r12", "r14", "r13"],
      answer: 2,
      feedback: [
        "16.12 would require the angles to be given equal.",
        "16.14 gives equal arcs. Here the targets are angles.",
        "Start with the equal straight lengths and compare their minor centre angles.",
      ],
    },
    write: {
      given:
        "AB and CD are equal chords of one circle. ∠APB and ∠CQD are circumference angles that intercept minor arc AB and minor arc CD respectively. ∠APB = 74°.",
      target: "Find ∠CQD.",
      options: ["∠CQD = ∠APB = 74°", "∠CQD = 37°", "∠CQD = 106°"],
      answer: 0,
      feedback: [
        "Equal chords cut off equal minor arcs. The angles at P and Q both intercept these minor arcs.",
        "Both vertices are on the circumference. There is no centre angle to halve.",
        "106° would intercept the corresponding major arc. Both angles here intercept minor arcs.",
      ],
    },
  },
  r14: {
    title: "From straight spans to arcs",
    terms: [chord, minorArc, circleSize],
    investigate:
      "Follow the matching straight chords. Drag B to lengthen them. Point to the shorter route on the circumference between each pair of endpoints.",
    prediction: {
      question: "Equal chords cut off which pair of equal curved lengths?",
      options: [
        "Minor arc AB and major arc CD",
        "Each arc and its own straight chord",
        "Minor arc AB and minor arc CD",
      ],
      answer: 2,
      feedback: [
        "Follow the shorter route for both pairs or the longer route for both pairs.",
        "The curve follows the rim, while the chord goes straight across.",
        "Yes. Minor arcs match each other. The two remaining major arcs also match each other.",
      ],
    },
    explanation:
      "Equal chords give equal minor centre angles. Those equal turns cut off equal minor arcs on the same circle.",
    check: {
      given:
        "The straight chords AB and CD belong to one circle and are equal.",
      target:
        "Show that the shorter curved paths from A to B and C to D have the same length.",
      options: ["r14", "r15", "r13"],
      answer: 0,
      feedback: [
        "Straight chord lengths are given. Curved arc lengths are the target.",
        "16.15 starts with equal arc lengths.",
        "16.13 leads to equal angles. Follow the requested target along the circumference.",
      ],
    },
    write: {
      given: "AB = CD in one circle. Major arc AB is 18 cm long.",
      target: "Find the length of major arc CD.",
      options: [
        "Minor arc CD = 18 cm",
        "Major arc CD = major arc AB = 18 cm",
        "CD = 18 cm",
      ],
      answer: 1,
      feedback: [
        "18 cm measures a major arc. Match the longer path for each pair.",
        "Equal chords cut off equal minor arcs and hence equal remaining major arcs.",
        "18 cm is measured along the rim. It cannot be copied onto the straight chord.",
      ],
    },
  },
  r15: {
    title: "From arcs to straight spans",
    terms: [{ ...minorArc, marks: ["arc-AB"] }, chord, circleSize],
    investigate:
      "Trace the equal curved arcs. Drag A to make them smaller. Join each pair of arc endpoints with a straight segment and compare the spans.",
    prediction: {
      question:
        "While the two curved arcs stay equal, which straight lengths must agree?",
      options: [
        "Chords AB and CD",
        "Chord AB and minor arc AB",
        "Chord CD and the diameter",
      ],
      answer: 0,
      feedback: [
        "Yes. Compare the straight segments joining the endpoints of the two arcs.",
        "A curved route and its straight shortcut have different lengths.",
        "Try a small arc. Its endpoints can be much closer than a full diameter.",
      ],
    },
    explanation:
      "Equal minor arcs give equal centre angles. Two equal radii enclosing each angle form congruent triangles by SAS, so their opposite chords are equal.",
    check: {
      given: "Minor arc AB and minor arc CD have equal lengths in one circle.",
      target: "Justify AB = CD, where AB and CD are straight segments.",
      options: ["r11", "r15", "r14"],
      answer: 1,
      feedback: [
        "16.11 concludes that angles are equal. The required line compares straight lengths.",
        "The equal curved lengths are given and their chords are being compared.",
        "16.14 starts with equal chords and gives equal arcs.",
      ],
    },
    write: {
      given:
        "Minor arcs AB and CD of one circle have equal lengths. Chord AB measures 11 cm.",
      target: "Find the straight distance from C to D.",
      options: ["Minor arc CD = 11 cm", "CD = 5.5 cm", "CD = AB = 11 cm"],
      answer: 2,
      feedback: [
        "11 cm measures the straight chord AB. The question also wants a straight length.",
        "11 cm already measures a whole chord.",
        "CD and AB are the chords joining the endpoints of the equal arcs.",
      ],
    },
  },
  r16: {
    title: "Compare turns at the centre",
    terms: [
      { ...centreAngle, marks: ["angle-AOB", "angle-COD"] },
      minorArc,
      ratio,
    ],
    investigate:
      "Drag B to change the first turn at O. Leave C and D fixed. Follow each turn to its own arc, keeping AB first and CD second.",
    prediction: {
      question:
        "Suppose the turn at O for arc AB is twice the turn for arc CD. What must double?",
      options: [
        "Chord AB is twice chord CD.",
        "The length of arc AB is twice the length of arc CD.",
        "The radius for AB is twice the radius for CD.",
      ],
      answer: 1,
      feedback: [
        "Chord length does not scale directly with its angle. Trace the curved part swept by the turn.",
        "Yes. A turn twice as large sweeps twice the distance around this circle.",
        "Every radius in the circle has the same length.",
      ],
    },
    explanation:
      "A centre angle of θ degrees takes θ/360 of the full circumference. In the ratio of two arc lengths from one circle, the common circumference cancels.",
    check: {
      given:
        "O is the centre of a circle. Its minor angles ∠AOB and ∠COD measure 50° and 75° respectively.",
      target:
        "Write a proportion comparing the corresponding minor arc lengths.",
      options: ["r17", "r10", "r16"],
      answer: 2,
      feedback: [
        "16.17 uses angles with vertices on the circumference. Both given angles have vertex O.",
        "16.10 covers equal angles. These angles have different measures.",
        "Compare the centre angles in the same order as their arcs.",
      ],
    },
    write: {
      given:
        "In one circle with centre O, ∠AOB = 48° and ∠COD = 120°. Minor arc CD is 15 cm long.",
      target: "Find the length of minor arc AB.",
      options: [
        "Minor arc AB = 15 × (48 ÷ 120) = 6 cm",
        "Minor arc AB = 15 × (120 ÷ 48) = 37.5 cm",
        "AB = 6 cm",
      ],
      answer: 0,
      feedback: [
        "AB goes with the 48° turn, so its arc is two-fifths the length of arc CD.",
        "The 48° arc is shorter than the 120° arc. Put its angle on top.",
        "The proportion gives a curved length. Include the arc symbol in your answer.",
      ],
    },
  },
  r17: {
    title: "Compare turns at the circumference",
    terms: [
      circumferenceAngle,
      {
        term: "The arc seen by an angle",
        meaning:
          "For ∠APB, follow arc AB on the side that leaves out P. For ∠CQD, follow arc CD on the side that leaves out Q.",
        marks: ["PA", "PB", "QC", "QD"],
      },
      ratio,
    ],
    investigate:
      "Move P along its allowed arc while A and B stay fixed. Then drag B to change arc AB. Which move changes the angle that sees arc AB?",
    prediction: {
      question:
        "∠APB and ∠CQD intercept two arcs of one circle. Which ratio equals arc AB ÷ arc CD?",
      options: ["∠CQD ÷ ∠APB", "AB ÷ CD, using straight chords", "∠APB ÷ ∠CQD"],
      answer: 2,
      feedback: [
        "Match the top arc AB to the angle whose arms end at A and B.",
        "The proportionality is for curved arc lengths. Straight chords follow a different relationship.",
        "Yes. AB pairs with the angle at P and CD with the angle at Q.",
      ],
    },
    explanation:
      "Each matching centre angle is double its circumference angle. Doubling both numbers leaves their ratio unchanged, so the same ratio gives the intercepted arc lengths.",
    check: {
      given:
        "P and Q are on the circumference. ∠APB = 25° and ∠CQD = 40° intercept arcs AB and CD respectively in this circle.",
      target:
        "Justify that the intercepted arc lengths are in the ratio 25 to 40.",
      options: ["r17", "r16", "r7"],
      answer: 0,
      feedback: [
        "The two angle vertices are on the circumference, and each angle is paired with its own arc.",
        "16.16 requires angles at the centre. The given vertices are P and Q.",
        "16.7 requires the same chord. The given angles stand on AB and CD.",
      ],
    },
    write: {
      given:
        "In one circle, ∠APB = 30° and ∠CQD = 45° are circumference angles. The arc AB intercepted by ∠APB is 8 cm long.",
      target: "Find the length of the arc CD intercepted by ∠CQD.",
      options: [
        "Arc CD = 8 × (30 ÷ 45) cm",
        "Arc CD = 8 × (45 ÷ 30) = 12 cm",
        "CD = 12 cm",
      ],
      answer: 1,
      feedback: [
        "The larger angle at Q intercepts the longer arc. The factor should exceed one.",
        "CD corresponds to 45° and AB to 30°, so arc CD is one and a half times as long.",
        "12 cm is a curved arc length. Write the arc symbol over CD.",
      ],
    },
  },
};
