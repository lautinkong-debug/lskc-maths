export type GameQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

function shuffled<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function mathsQuestion(index: number): GameQuestion {
  const n = Math.floor(index / 5) + 2;
  let question: string;
  let answer: number;
  let explanation: string;
  switch (index % 5) {
    case 0:
      question = `Solve 3x + 4 = ${3 * n + 4}. What is x?`;
      answer = n;
      explanation = `x = (${3 * n + 4} − 4) ÷ 3 = ${n}`;
      break;
    case 1:
      question = `A rectangle measures ${n + 3} cm by ${n} cm. Find its perimeter in cm.`;
      answer = 2 * (2 * n + 3);
      explanation = `2 × (${n + 3} + ${n}) = ${answer}`;
      break;
    case 2:
      question = `Two angles of a triangle are ${n + 25}° and 65°. Find the third angle in degrees.`;
      answer = 90 - n;
      explanation = `180 − ${n + 25} − 65 = ${answer}`;
      break;
    case 3:
      question = `An item costs HK$${n * 20} before a 20% discount. Find its sale price in HK dollars.`;
      answer = 16 * n;
      explanation = `${n * 20} × 0.8 = ${answer}`;
      break;
    default:
      question = `Given a = −${n}, find a² + 3.`;
      answer = n * n + 3;
      explanation = `(−${n})² + 3 = ${answer}`;
  }
  const options = shuffled(
    [answer, answer - 2, answer + 1, answer + 4].map(String),
  );
  return {
    question,
    options,
    correctIndex: options.indexOf(String(answer)),
    explanation,
  };
}

export function makeMathsBank(count: number): GameQuestion[] {
  return Array.from({ length: count }, (_, index) => mathsQuestion(index));
}

function parseLine(line: string) {
  const [question, ...answers] = line.split("|").map((field) => field.trim());
  const options = shuffled(answers);
  return { question, options, correctIndex: options.indexOf(answers[0]) };
}

export function parseBank(raw: string, minOptions: 3 | 4 = 4): GameQuestion[] {
  const content = raw.trim();
  if (!content) throw new Error("Enter at least one question.");

  let rows: unknown;
  if (content.startsWith("[")) {
    try {
      rows = JSON.parse(content);
    } catch {
      throw new Error("Check the JSON syntax.");
    }
  } else {
    rows = content
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map(parseLine);
  }
  if (!Array.isArray(rows) || !rows.length)
    throw new Error("The question bank is empty.");

  return rows.map((value: unknown, index): GameQuestion => {
    const choices = minOptions === 3 ? "three or four" : "four";
    const error = `Question ${index + 1} needs a prompt, ${choices} different choices and a valid answer.`;
    if (!value || typeof value !== "object") throw new Error(error);
    const row = value as Record<string, unknown>;
    const question =
      typeof row.question === "string" ? row.question.trim() : "";
    const options = Array.isArray(row.options)
      ? row.options.map((option: unknown) => {
          if (typeof option === "string") return option.trim();
          return typeof option === "number" && Number.isFinite(option)
            ? String(option)
            : "";
        })
      : [];
    const correctIndex = row.correctIndex;
    if (
      !question ||
      options.length < minOptions ||
      options.length > 4 ||
      options.includes("") ||
      new Set(options).size !== options.length ||
      typeof correctIndex !== "number" ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex >= options.length
    ) {
      throw new Error(error);
    }
    return {
      question,
      options,
      correctIndex,
      ...(typeof row.explanation === "string"
        ? { explanation: row.explanation }
        : {}),
    };
  });
}

export function forThreeLanes(question: GameQuestion): GameQuestion {
  if (question.options.length === 3) return question;
  const answer = question.options[question.correctIndex];
  const distractors = question.options.filter(
    (_, index) => index !== question.correctIndex,
  );
  const options = shuffled([answer, ...shuffled(distractors).slice(0, 2)]);
  return { ...question, options, correctIndex: options.indexOf(answer) };
}
