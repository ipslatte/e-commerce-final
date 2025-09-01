import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const now = new Date().toISOString();

    // Find active flash sale for this product
    const flashSale = await db
      .collection("flashSales")
      .aggregate([
        {
          $match: {
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gt: now },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $match: {
            "products.productId": params.id.toString(),
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            startDate: 1,
            endDate: 1,
            "products.discountType": 1,
            "products.discountValue": 1,
          },
        },
      ])
      .toArray();

    console.log("Flash sale query result:", {
      productId: params.id,
      flashSale,
      now,
    });

    if (flashSale.length === 0) {
      return NextResponse.json(null);
    }

    // Return the flash sale details
    const response = {
      id: flashSale[0]._id.toString(),
      name: flashSale[0].name,
      startDate: flashSale[0].startDate,
      endDate: flashSale[0].endDate,
      discountType: flashSale[0].products.discountType,
      discountValue: flashSale[0].products.discountValue,
    };

    console.log("Returning flash sale details:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[FLASH_SALE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch flash sale information" },
      { status: 500 }
    );
  }
}
