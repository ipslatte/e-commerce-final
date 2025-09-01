import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const now = new Date().toISOString();

    // Find active flash sales that are currently running or upcoming
    const flashSales = await db
      .collection("flashSales")
      .aggregate([
        {
          $match: {
            isActive: true,
            endDate: { $gt: now }, // Compare with ISO string
          },
        },
        // Add date conversion stage
        {
          $addFields: {
            startDateObj: { $toDate: "$startDate" },
            endDateObj: { $toDate: "$endDate" },
          },
        },
        // Unwind the products array to handle each product separately
        { $unwind: "$products" },
        // Convert string IDs to ObjectId for lookup
        {
          $addFields: {
            "products.productId": { $toObjectId: "$products.productId" },
          },
        },
        // Lookup product details
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        // Unwind productDetails array
        { $unwind: "$productDetails" },
        // Combine product details with flash sale product info
        {
          $addFields: {
            products: {
              $mergeObjects: [
                "$productDetails",
                {
                  discountType: "$products.discountType",
                  discountValue: "$products.discountValue",
                  soldQuantity: "$products.soldQuantity",
                },
              ],
            },
          },
        },
        // Group back by flash sale
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            description: { $first: "$description" },
            startDate: { $first: "$startDate" },
            endDate: { $first: "$endDate" },
            startDateObj: { $first: "$startDateObj" },
            endDateObj: { $first: "$endDateObj" },
            isActive: { $first: "$isActive" },
            products: { $push: "$products" },
          },
        },
        {
          $sort: { startDateObj: 1 }, // Sort by converted date
        },
      ])
      .toArray();

    // Log the results for debugging
    console.log("Flash Sales found:", flashSales);

    return NextResponse.json(flashSales);
  } catch (error) {
    console.error("[FLASH_SALES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch flash sales" },
      { status: 500 }
    );
  }
}
