export type QuizQuestion = {
  id: string;
  text: string;
};

// User-facing quiz questions. Scale shown to user: 1 = Never, 5 = Often.
// Category mapping is internal-only and lives server-side (see docs/content-reference.md §2) —
// it must never be imported into client-facing code.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "How often did the relationship move very fast early on — big declarations, talk of a future together, within weeks?",
  },
  {
    id: "q2",
    text: "How often do they deny saying something you clearly remember them saying?",
  },
  {
    id: "q3",
    text: "How often do they seem upset or discouraging when you make plans with friends or family without them?",
  },
  {
    id: "q4",
    text: "How often do they compare you to an ex or bring in someone else's opinion when you set a boundary?",
  },
  {
    id: "q5",
    text: "How often do they go silent for extended periods after a disagreement, with no explanation?",
  },
  {
    id: "q6",
    text: "How often do they talk about future plans that then get delayed or don't happen?",
  },
  {
    id: "q7",
    text: "How often do arguments end with you apologizing, even when you raised a valid concern?",
  },
  {
    id: "q8",
    text: "How often are they very attentive one week and distant the next, with no clear reason?",
  },
  {
    id: "q9",
    text: "How often do they bring up everything they've done for you when you say no to something?",
  },
  {
    id: "q10",
    text: "How often do their compliments come with a subtle put-down attached?",
  },
];

export const FREE_TEXT_MAX_LENGTH = 200;
export const SCALE_MIN = 1;
export const SCALE_MAX = 5;
export const SCALE_LABELS: Record<number, string> = {
  1: "Never",
  5: "Often",
};
