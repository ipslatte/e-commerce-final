import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const discounts = await db
      .collection("discounts")
      .aggregate([
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("[DISCOUNTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { productId, type, value, startDate, endDate, isActive } = body;

    if (!type || !value || !startDate || !endDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Convert productId to ObjectId if it exists
    const discount = {
      ...body,
      productId: productId ? new ObjectId(productId) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("discounts").insertOne(discount);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[DISCOUNTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Discount ID required", { status: 400 });
    }

    const body = await req.json();
    const { productId, type, value, startDate, endDate, isActive } = body;

    if (!type || !value || !startDate || !endDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateData = {
      ...body,
      productId: productId ? new ObjectId(productId) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("discounts")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    if (!result) {
      return new NextResponse("Discount not found", { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[DISCOUNTS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Discount ID required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("discounts").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return new NextResponse("Discount not found", { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[DISCOUNTS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
