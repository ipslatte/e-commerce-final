import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Please add it to your .env file"
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any, // Latest stable version
  typescript: true,
});

export const formatAmountForStripe = (
  amount: number,
  currency: string
): number => {
  const currencies = ["USD", "EUR", "GBP"];
  if (!currencies.includes(currency)) {
    throw new Error("Unsupported currency");
  }

  const multiplier = 100; // For USD, EUR, GBP
  return Math.round(amount * multiplier);
};
