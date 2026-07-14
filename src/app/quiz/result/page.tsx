"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/category-labels";
import type { QuizSubmitResult } from "@/types/quiz";

const RESULT_STORAGE_KEY = "tactic-check-quiz-result";

type SuccessResult = Extract<QuizSubmitResult, { risk_flag: false }>;

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SuccessResult | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) {
      router.replace("/quiz");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as QuizSubmitResult;
      if (parsed.risk_flag) {
        router.replace("/quiz");
        return;
      }
      // Syncing from sessionStorage (an external system) on mount, not
      // reacting to React state — the sanctioned effect use case.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(parsed);
    } catch {
      router.replace("/quiz");
    }
  }, [router]);

  if (!result) return null;

  const { archetype, top_categories } = result;
  const [category1, category2] = top_categories;
  const shareText = `I got "${archetype.name}" — what's your pattern?`;

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText, url });
        return;
      } catch {
        // user cancelled or share failed; fall through to clipboard copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          Your profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{archetype.name}</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          {archetype.description}
        </p>

        <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
          {archetype.statPercentage}% of people who scored high on{" "}
          {categoryLabel(category1)} also flagged {categoryLabel(category2)}.
          You&apos;re not imagining the pattern.
        </p>

        <div className="mt-10 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <p className="font-medium">{shareText}</p>
          <p className="mt-1 text-sm text-neutral-500">Take the quiz</p>
          <button
            type="button"
            onClick={handleShare}
            className="mt-4 rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {shareState === "copied" ? "Link copied" : "Share your result"}
          </button>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
