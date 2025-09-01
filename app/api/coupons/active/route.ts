import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get current date for comparison
    const now = new Date();

    // Find active coupons that are currently valid
    const coupons = await db
      .collection("coupons")
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gt: now },
      })
      .project({
        code: 1,
        type: 1,
        value: 1,
        minPurchase: 1,
        maxDiscount: 1,
        endDate: 1,
        usageLimit: 1,
        usedCount: 1,
        description: 1,
      })
      .sort({ endDate: 1 })
      .toArray();

    // Transform the data for public consumption
    const publicCoupons = coupons.map((coupon) => ({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount,
      endDate: coupon.endDate,
      description: coupon.description,
      // Only show remaining uses if there's a usage limit
      remainingUses: coupon.usageLimit
        ? coupon.usageLimit - (coupon.usedCount || 0)
        : null,
    }));

    return NextResponse.json(publicCoupons);
  } catch (error) {
    console.error("[ACTIVE_COUPONS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch active coupons" },
      { status: 500 }
    );
  }
}
