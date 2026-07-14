import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Tactic Check</h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          A quick, free quiz to help you spot patterns in a relationship —
          with an optional personalized workbook if you want to go deeper.
        </p>
        <Link
          href="/quiz"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-8 text-base font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Take the quiz
        </Link>
      </div>
    </main>
  );
}
