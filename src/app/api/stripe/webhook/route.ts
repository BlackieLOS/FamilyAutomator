import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

// Card payments confirm synchronously on checkout.session.completed; UPI and
// other delayed methods confirm later via the async_payment_* events. We
// only mark a Purchase paid once Stripe reports payment_status === "paid".
const RELEVANT_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const purchase = await prisma.purchase.findUnique({
    where: { providerPaymentId: session.id },
  });

  if (!purchase) {
    console.warn(`[stripe/webhook] no Purchase found for session ${session.id}`);
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "failed" } });
    return NextResponse.json({ received: true });
  }

  if (session.payment_status === "paid" && purchase.status !== "paid") {
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "paid" } });
    // Stage 5 hooks workbook generation in here, triggered only on this
    // confirmed-payment path — never speculatively before payment.
  }

  return NextResponse.json({ received: true });
}
