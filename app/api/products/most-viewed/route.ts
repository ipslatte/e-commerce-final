import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get URL parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "8");

    // Find products with views > 0, sort by views in descending order
    const products = await db
      .collection("products")
      .find({ views: { $gt: 0 } })
      .sort({ views: -1, lastViewed: -1 })
      .limit(limit)
      .toArray();

    // Transform the products to include string IDs and format dates
    const transformedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      lastViewed: product.lastViewed
        ? new Date(product.lastViewed).toISOString()
        : null,
      category: {
        ...product.category,
        _id: product.category._id.toString(),
      },
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("[MOST_VIEWED_PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch most viewed products" },
      { status: 500 }
    );
  }
}
