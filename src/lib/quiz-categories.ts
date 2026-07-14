// Internal scoring data — never imported from client components, never
// rendered in any user-facing UI. See docs/content-reference.md §2.

export type Category =
  | "love_bombing"
  | "gaslighting"
  | "isolation"
  | "triangulation"
  | "stonewalling"
  | "future_faking"
  | "darvo"
  | "intermittent_reinforcement"
  | "guilt_tripping"
  | "negging";

// Ordered q1..q10 to match the question order (used for tie-break).
export const QUESTION_CATEGORY_ORDER: { questionId: string; category: Category }[] = [
  { questionId: "q1", category: "love_bombing" },
  { questionId: "q2", category: "gaslighting" },
  { questionId: "q3", category: "isolation" },
  { questionId: "q4", category: "triangulation" },
  { questionId: "q5", category: "stonewalling" },
  { questionId: "q6", category: "future_faking" },
  { questionId: "q7", category: "darvo" },
  { questionId: "q8", category: "intermittent_reinforcement" },
  { questionId: "q9", category: "guilt_tripping" },
  { questionId: "q10", category: "negging" },
];

export const QUESTION_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
  QUESTION_CATEGORY_ORDER.map(({ questionId, category }) => [questionId, category]),
) as Record<string, Category>;
