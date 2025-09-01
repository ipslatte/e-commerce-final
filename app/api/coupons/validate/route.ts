import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!cartTotal || typeof cartTotal !== "number") {
      return NextResponse.json(
        { error: "Valid cart total is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get current date for comparison
    const now = new Date();

    const coupon = await db.collection("coupons").findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // Check if coupon has date restrictions and validate them
    if (coupon.startDate && coupon.endDate) {
      const startDate = new Date(coupon.startDate);
      const endDate = new Date(coupon.endDate);

      if (now < startDate) {
        return NextResponse.json(
          {
            error: `Coupon is not valid until ${startDate.toLocaleDateString()}`,
          },
          { status: 400 }
        );
      }

      if (now > endDate) {
        return NextResponse.json(
          { error: `Coupon expired on ${endDate.toLocaleDateString()}` },
          { status: 400 }
        );
      }
    }

    // Check minimum purchase requirement
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase amount of $${coupon.minPurchase.toFixed(
            2
          )} required`,
        },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (cartTotal * coupon.value) / 100;
      // Apply maximum discount cap if exists
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.value, cartTotal); // Don't allow discount greater than cart total
    }

    // Update usage count
    await db.collection("coupons").updateOne(
      { _id: coupon._id },
      {
        $inc: { usedCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      valid: true,
      discount: discountAmount,
      type: coupon.type,
      value: coupon.value,
      couponId: coupon._id,
    });
  } catch (error) {
    console.error("[COUPON_VALIDATE]", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
