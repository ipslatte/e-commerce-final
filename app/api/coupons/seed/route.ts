import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const coupons = [
      {
        code: "WELCOME20",
        type: "percentage",
        value: 20,
        minPurchase: 50,
        description: "New Customer Special",
        startDate: new Date(),
        endDate: new Date("2024-12-31"),
        isActive: true,
        usageLimit: 100,
        usedCount: 0,
      },
      {
        code: "FLASH50",
        type: "percentage",
        value: 50,
        minPurchase: 100,
        description: "Flash Sale Special",
        startDate: new Date(),
        endDate: new Date("2024-12-31"),
        isActive: true,
        usageLimit: 50,
        usedCount: 0,
      },
      {
        code: "FREESHIP",
        type: "shipping",
        value: 0,
        minPurchase: 0,
        description: "Free Shipping",
        startDate: new Date(),
        endDate: new Date("2024-12-31"),
        isActive: true,
        usageLimit: null,
        usedCount: 0,
      },
    ];

    // Clear existing coupons
    await db.collection("coupons").deleteMany({});

    // Insert new coupons
    const result = await db.collection("coupons").insertMany(coupons);

    return NextResponse.json({
      message: "Coupons seeded successfully",
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("[COUPONS_SEED]", error);
    return NextResponse.json(
      { error: "Failed to seed coupons" },
      { status: 500 }
    );
  }
}
