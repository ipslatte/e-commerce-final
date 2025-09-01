import { NextResponse } from "next/server";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = "USD", items } = body;

    console.log("Received amount:", amount); // Debug log

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Convert amount to cents for Stripe
    const stripeAmount = formatAmountForStripe(amount, currency);
    console.log("Stripe amount (in cents):", stripeAmount); // Debug log

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: session.user.id,
        items: JSON.stringify(items),
      },
    });

    console.log("Payment Intent created:", paymentIntent.id); // Debug log

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
