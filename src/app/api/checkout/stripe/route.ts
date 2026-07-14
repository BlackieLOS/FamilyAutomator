import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { WORKBOOK_PRICE_INR_PAISE, WORKBOOK_PRICE_USD_CENTS } from "@/lib/pricing";

type CheckoutMethod = "card" | "upi";

function isCheckoutMethod(value: unknown): value is CheckoutMethod {
  return value === "card" || value === "upi";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { quizResponseId, method } = (body ?? {}) as Record<string, unknown>;

  if (typeof quizResponseId !== "string" || !isCheckoutMethod(method)) {
    return NextResponse.json(
      { error: "Expected { quizResponseId: string, method: 'card' | 'upi' }." },
      { status: 400 },
    );
  }

  const quizResponse = await prisma.quizResponse.findUnique({
    where: { id: quizResponseId },
  });

  if (!quizResponse || quizResponse.riskFlag) {
    return NextResponse.json({ error: "Quiz response not found." }, { status: 404 });
  }

  const currency = method === "upi" ? "inr" : "usd";
  const amount = method === "upi" ? WORKBOOK_PRICE_INR_PAISE : WORKBOOK_PRICE_USD_CENTS;
  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    method === "upi" ? ["upi"] : ["card"];

  const origin = new URL(request.url).origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: "Tactic Check — Personalized Workbook",
            description:
              "Tailored red flags, journaling prompts, and a clear next step.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/quiz/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/quiz/purchase/cancelled`,
    metadata: { quizResponseId },
  });

  await prisma.purchase.create({
    data: {
      quizResponseId,
      provider: "stripe",
      providerPaymentId: session.id,
      amount,
      currency,
      status: "pending",
    },
  });

  return NextResponse.json({ url: session.url });
}
