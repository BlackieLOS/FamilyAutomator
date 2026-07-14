export default function CrisisPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Your safety matters.</h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Something you shared suggests you might be in danger or struggling
          right now. You don&apos;t have to go through this alone — the
          resources below are free, confidential, and available any time.
        </p>

        <div className="mt-8 space-y-4 text-left">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="font-medium">988 Suicide &amp; Crisis Lifeline</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Call or text 988 (US) — available 24/7.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="font-medium">National Domestic Violence Hotline</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Call 1-800-799-7233, or text &quot;START&quot; to 88788 — available 24/7.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="font-medium">In immediate danger?</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Please contact local emergency services right away.
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm text-neutral-500">
          This quiz result isn&apos;t shown for this session — these
          resources are the priority right now.
        </p>
      </div>
    </main>
  );
}
