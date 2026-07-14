import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FREE_TEXT_MAX_LENGTH } from "@/lib/quiz-questions";
import {
  QUESTION_CATEGORY_ORDER,
  QUESTION_TO_CATEGORY,
  type Category,
} from "@/lib/quiz-categories";
import { resolveArchetype } from "@/lib/archetypes";
import { screenForRisk } from "@/lib/risk-screen";
import { prisma } from "@/lib/db";
import type { QuizAnswer, QuizSubmitResult } from "@/types/quiz";

const SESSION_COOKIE = "tc_session_id";

const VALID_QUESTION_IDS = new Set(
  QUESTION_CATEGORY_ORDER.map((q) => q.questionId),
);

function validateAnswers(body: unknown): QuizAnswer[] | null {
  if (!body || typeof body !== "object" || !("answers" in body)) return null;
  const answers = (body as { answers: unknown }).answers;
  if (!Array.isArray(answers) || answers.length !== VALID_QUESTION_IDS.size) {
    return null;
  }

  const seen = new Set<string>();
  const parsed: QuizAnswer[] = [];

  for (const raw of answers) {
    if (!raw || typeof raw !== "object") return null;
    const { questionId, value, note } = raw as Record<string, unknown>;

    if (typeof questionId !== "string" || !VALID_QUESTION_IDS.has(questionId)) {
      return null;
    }
    if (seen.has(questionId)) return null;
    seen.add(questionId);

    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
      return null;
    }

    if (note !== undefined) {
      if (typeof note !== "string" || note.length > FREE_TEXT_MAX_LENGTH) {
        return null;
      }
    }

    parsed.push({ questionId, value, note });
  }

  return parsed;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const answers = validateAnswers(body);
  if (!answers) {
    return NextResponse.json(
      { error: "Expected 10 answers, one per question, each with value 1-5." },
      { status: 400 },
    );
  }

  const notes = answers.map((a) => a.note ?? "");
  const riskFlag = screenForRisk(notes);

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) sessionId = randomUUID();

  if (riskFlag) {
    // Log the flag for internal awareness without the free-text content itself.
    console.warn("[quiz/submit] risk_flag raised for a submission");
    await prisma.quizResponse.create({
      data: {
        sessionId,
        answers,
        categoryScores: {},
        archetype: "",
        riskFlag: true,
      },
    });
    const result: QuizSubmitResult = { risk_flag: true };
    const res = NextResponse.json(result);
    res.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax" });
    return res;
  }

  const categoryScores: Record<string, number> = {};
  for (const answer of answers) {
    const category = QUESTION_TO_CATEGORY[answer.questionId];
    categoryScores[category] = answer.value;
  }

  const ranked = QUESTION_CATEGORY_ORDER.map(({ category }, orderIndex) => ({
    category,
    score: categoryScores[category],
    orderIndex,
  })).sort((a, b) => b.score - a.score || a.orderIndex - b.orderIndex);

  const top2: [Category, Category] = [ranked[0].category, ranked[1].category];
  const archetype = resolveArchetype(top2);

  const quizResponse = await prisma.quizResponse.create({
    data: {
      sessionId,
      answers,
      categoryScores,
      archetype: archetype.name,
      riskFlag: false,
    },
  });

  const result: QuizSubmitResult = {
    risk_flag: false,
    quiz_response_id: quizResponse.id,
    category_scores: categoryScores,
    top_categories: top2,
    archetype,
  };
  const res = NextResponse.json(result);
  res.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax" });
  return res;
}
