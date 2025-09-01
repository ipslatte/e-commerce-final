import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/admin/promotions/flash-sales
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const flashSales = await db
      .collection("flashSales")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(flashSales);
  } catch (error) {
    console.error("[FLASH_SALES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/admin/promotions/flash-sales
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("flashSales").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[FLASH_SALES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/admin/promotions/flash-sales
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Flash sale ID required", { status: 400 });
    }

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return new NextResponse("Invalid flash sale ID", { status: 400 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();

    // Convert product IDs to ObjectId if they exist
    const updatedBody = {
      ...body,
      products: body.products?.map((product: any) => ({
        ...product,
        productId: new ObjectId(product.productId),
      })),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("flashSales")
      .findOneAndUpdate(
        { _id: objectId },
        { $set: updatedBody },
        { returnDocument: "after" }
      );

    if (!result || !result.value) {
      return new NextResponse("Flash sale not found", { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("[FLASH_SALES_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/promotions/flash-sales
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Flash sale ID required", { status: 400 });
    }

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return new NextResponse("Invalid flash sale ID", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("flashSales")
      .findOneAndDelete({ _id: objectId });

    if (!result || !result.value) {
      return new NextResponse("Flash sale not found", { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("[FLASH_SALES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
