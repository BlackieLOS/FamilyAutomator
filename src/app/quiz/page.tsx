"use client";

import { useState } from "react";
import {
  FREE_TEXT_MAX_LENGTH,
  QUIZ_QUESTIONS,
  SCALE_LABELS,
} from "@/lib/quiz-questions";
import type { QuizAnswer } from "@/types/quiz";

const SCALE_VALUES = [1, 2, 3, 4, 5];
const STORAGE_KEY = "tactic-check-quiz-answers";

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  const question = QUIZ_QUESTIONS[step];
  const current = answers[question?.id];
  const isLastStep = step === QUIZ_QUESTIONS.length - 1;
  const canAdvance = current?.value !== undefined;

  function setValue(value: number) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { questionId: question.id, value, note: prev[question.id]?.note },
    }));
  }

  function setNote(note: string) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        value: prev[question.id]?.value,
        note,
      } as QuizAnswer,
    }));
  }

  function goNext() {
    if (!canAdvance) return;
    if (isLastStep) {
      const orderedAnswers = QUIZ_QUESTIONS.map((q) => answers[q.id]);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orderedAnswers));
      setSubmitted(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  if (submitted) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Thanks for sharing.</h1>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Your responses have been saved. Scoring and your personalized
            result are next.
          </p>
        </div>
      </main>
    );
  }

  const progressPct = Math.round(((step + 1) / QUIZ_QUESTIONS.length) * 100);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-neutral-500">
            <span>
              Question {step + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all duration-300 dark:bg-neutral-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-medium leading-snug sm:text-2xl">
          {question.text}
        </h2>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-2">
            {SCALE_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue(value)}
                className={`flex h-14 flex-1 flex-col items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  current?.value === value
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 bg-transparent text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
                }`}
                aria-pressed={current?.value === value}
              >
                <span>{value}</span>
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>{SCALE_LABELS[1]}</span>
            <span>{SCALE_LABELS[5]}</span>
          </div>
        </div>

        <div className="mt-6">
          <textarea
            value={current?.note ?? ""}
            onChange={(e) => setNote(e.target.value.slice(0, FREE_TEXT_MAX_LENGTH))}
            maxLength={FREE_TEXT_MAX_LENGTH}
            placeholder="Add detail (optional)"
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-3 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700"
          />
          <div className="mt-1 text-right text-xs text-neutral-400">
            {(current?.note ?? "").length}/{FREE_TEXT_MAX_LENGTH}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 disabled:opacity-0 dark:text-neutral-400"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance}
            className="rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}
