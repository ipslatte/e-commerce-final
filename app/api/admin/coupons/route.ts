import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET - Fetch all coupons (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const coupons = await db.collection("coupons").find({}).toArray();

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("[COUPONS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const data = await req.json();
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      usageLimit,
      description,
    } = data;

    // Validate required fields
    if (!code || !type || !value) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await db.collection("coupons").findOne({ code });
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = {
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive ?? true,
      usageLimit: usageLimit || null,
      usedCount: 0,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("coupons").insertOne(coupon);
    return NextResponse.json({ ...coupon, _id: result.insertedId });
  } catch (error) {
    console.error("[COUPONS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon (admin only)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const data = await req.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Check if updating code and if it already exists
    if (updateData.code) {
      const existingCoupon = await db
        .collection("coupons")
        .findOne({ code: updateData.code, _id: { $ne: new ObjectId(_id) } });
      if (existingCoupon) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Update dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    updateData.updatedAt = new Date();

    const result = await db
      .collection("coupons")
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    if (!result) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[COUPONS_PUT]", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon (admin only)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("coupons")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("[COUPONS_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
