import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

// Lazily constructed so importing this module doesn't require
// STRIPE_SECRET_KEY at build time — only when a request actually needs it.
export function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }

  cachedStripe = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });
  return cachedStripe;
}
