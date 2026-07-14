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
  const [checkoutMethod, setCheckoutMethod] = useState<"card" | "upi" | null>(null);
  const [checkoutError, setCheckoutError] = useState(false);

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

  async function handleCheckout(method: "card" | "upi") {
    setCheckoutMethod(method);
    setCheckoutError(false);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizResponseId: result?.quiz_response_id, method }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {
      setCheckoutMethod(null);
      setCheckoutError(true);
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

        <div className="mt-10 rounded-xl border border-neutral-200 p-6 text-left dark:border-neutral-800">
          <p className="font-medium">
            Want the full picture? Get your personalized workbook — tailored
            red flags, journaling prompts, and a clear next step. $2.99.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleCheckout("card")}
              disabled={checkoutMethod !== null}
              className="rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              {checkoutMethod === "card" ? "Redirecting…" : "Pay $2.99 with card"}
            </button>
            <button
              type="button"
              onClick={() => handleCheckout("upi")}
              disabled={checkoutMethod !== null}
              className="rounded-lg border border-neutral-300 px-6 py-2 text-sm font-medium transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:border-neutral-500"
            >
              {checkoutMethod === "upi" ? "Redirecting…" : "Pay ₹249 with UPI"}
            </button>
            <button
              type="button"
              disabled
              title="PayPal checkout is coming soon"
              className="rounded-lg border border-neutral-200 px-6 py-2 text-sm font-medium text-neutral-400 dark:border-neutral-800 dark:text-neutral-600"
            >
              Pay with PayPal (coming soon)
            </button>
          </div>

          {checkoutError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              Something went wrong starting checkout. Please try again.
            </p>
          )}
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
