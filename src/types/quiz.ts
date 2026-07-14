export type QuizAnswer = {
  questionId: string;
  value: number;
  note?: string;
};

export type QuizSubmitResult =
  | { risk_flag: true }
  | {
      risk_flag: false;
      quiz_response_id: string;
      category_scores: Record<string, number>;
      top_categories: [string, string];
      archetype: { name: string; description: string; statPercentage: number };
    };
