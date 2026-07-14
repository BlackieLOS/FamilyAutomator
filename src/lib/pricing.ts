// Workbook pricing per docs/content-reference.md §6 ($2.99), plus an
// India-specific UPI price point since Stripe's UPI payment method requires
// an INR-denominated charge.
export const WORKBOOK_PRICE_USD_CENTS = 299;
export const WORKBOOK_PRICE_INR_PAISE = 24_900; // ₹249
