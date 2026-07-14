import Link from "next/link";

export default function PurchaseCancelledPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Checkout cancelled.</h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          No charge was made. You can pick up your workbook any time from
          your result.
        </p>
        <Link
          href="/quiz/result"
          className="mt-8 inline-block rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          Back to your result
        </Link>
      </div>
    </main>
  );
}
