import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get active coupons count
    const activeCoupons = await db
      .collection("coupons")
      .countDocuments({ isActive: true });

    // Get active flash sales count
    const activeFlashSales = await db
      .collection("flashSales")
      .countDocuments({ isActive: true });

    // Calculate total savings
    const coupons = await db
      .collection("coupons")
      .find({ isActive: true })
      .toArray();
    const totalSavings = coupons.reduce((acc, coupon) => {
      if (coupon.type === "fixed") {
        return acc + coupon.value * coupon.usedCount;
      } else {
        // For percentage discounts, we'll use an average order value of $100 for estimation
        return acc + ((100 * coupon.value) / 100) * coupon.usedCount;
      }
    }, 0);

    return NextResponse.json({
      activeCoupons,
      activeFlashSales,
      totalSavings: Math.round(totalSavings),
    });
  } catch (error) {
    console.error("Error fetching promotion stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
