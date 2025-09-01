import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get current product
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(params.id) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Initialize views if it doesn't exist
    const currentViews = typeof product.views === "number" ? product.views : 0;

    // Update views and lastViewed
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          views: currentViews + 1,
          lastViewed: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCT_VIEW_POST]", error);
    return NextResponse.json(
      { error: "Failed to update view count" },
      { status: 500 }
    );
  }
}
