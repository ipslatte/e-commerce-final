import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Order } from "@/models/Order";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const payment_intent = searchParams.get("payment_intent");

    if (!payment_intent) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent, {
      expand: ["shipping"],
    });
    const success = paymentIntent.status === "succeeded";

    if (success) {
      const client = await clientPromise;
      await client.connect();

      // Check if order already exists for this payment intent
      const existingOrder = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (!existingOrder) {
        // Create new order
        const order = await Order.create({
          userId: session.user.id,
          paymentIntentId: paymentIntent.id,
          total: paymentIntent.amount / 100,
          status: "processing",
          items: JSON.parse(paymentIntent.metadata.items || "[]"),
          shippingAddress: {
            fullName: paymentIntent.shipping?.name,
            addressLine1: paymentIntent.shipping?.address?.line1,
            addressLine2: paymentIntent.shipping?.address?.line2,
            city: paymentIntent.shipping?.address?.city,
            state: paymentIntent.shipping?.address?.state,
            postalCode: paymentIntent.shipping?.address?.postal_code,
            country: paymentIntent.shipping?.address?.country,
            phone: paymentIntent.shipping?.phone,
          },
        });

        console.log("Order created:", order._id);
      }
    }

    return NextResponse.json({
      success,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
