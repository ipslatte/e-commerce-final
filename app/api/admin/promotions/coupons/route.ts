import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/admin/promotions/coupons
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const coupons = await db
      .collection("coupons")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("[COUPONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/admin/promotions/coupons
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("coupons").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[COUPONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/admin/promotions/coupons
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Coupon ID required", { status: 400 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("coupons").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result || !result.value) {
      return new NextResponse("Coupon not found", { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("[COUPONS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/promotions/coupons
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Coupon ID required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("coupons")
      .findOneAndDelete({ _id: new ObjectId(id) });

    if (!result || !result.value) {
      return new NextResponse("Coupon not found", { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("[COUPONS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
