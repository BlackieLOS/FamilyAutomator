export type QuizAnswer = {
  questionId: string;
  value: number;
  note?: string;
};

export type QuizSubmitResult =
  | { risk_flag: true }
  | {
      risk_flag: false;
      category_scores: Record<string, number>;
      top_categories: [string, string];
      archetype: { name: string; description: string; statPercentage: number };
    };
