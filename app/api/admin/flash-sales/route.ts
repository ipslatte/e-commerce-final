import { NextRequest, NextResponse } from "next/server";
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
    const flashSales = await db.collection("flashSales").find().toArray();

    return NextResponse.json(flashSales);
  } catch (error) {
    console.error("[FLASH_SALES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, startDate, endDate, isActive, products } = body;

    if (
      !name ||
      !startDate ||
      !endDate ||
      !products ||
      !Array.isArray(products)
    ) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const flashSale = await db.collection("flashSales").insertOne({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      products: products.map((product) => ({
        ...product,
        productId: new ObjectId(product.productId),
        soldQuantity: 0,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(flashSale);
  } catch (error) {
    console.error("[FLASH_SALES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Flash sale id required", { status: 400 });
    }

    const body = await req.json();
    const { name, description, startDate, endDate, isActive, products } = body;

    if (
      !name ||
      !startDate ||
      !endDate ||
      !products ||
      !Array.isArray(products)
    ) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updatedFlashSale = await db.collection("flashSales").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive,
          products: products.map((product) => ({
            ...product,
            productId: new ObjectId(product.productId),
          })),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!updatedFlashSale) {
      return new NextResponse("Flash sale not found", { status: 404 });
    }

    return NextResponse.json(updatedFlashSale);
  } catch (error) {
    console.error("[FLASH_SALES_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Flash sale id required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const deletedFlashSale = await db
      .collection("flashSales")
      .findOneAndDelete({
        _id: new ObjectId(id),
      });

    if (!deletedFlashSale) {
      return new NextResponse("Flash sale not found", { status: 404 });
    }

    return NextResponse.json(deletedFlashSale);
  } catch (error) {
    console.error("[FLASH_SALES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
