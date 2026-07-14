import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const purchase = sessionId
    ? await prisma.purchase.findUnique({ where: { providerPaymentId: sessionId } })
    : null;

  const isPaid = purchase?.status === "paid";

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">
          {isPaid ? "Payment received." : "Thanks — almost there."}
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          {isPaid
            ? "We're preparing your personalized workbook now. You'll get an email with your download link shortly."
            : "We're confirming your payment. This can take a moment for some payment methods — you'll get an email once your workbook is ready."}
        </p>
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
