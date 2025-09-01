import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    // Get products sorted by views
    const products = await Product.find()
      .populate("category", "name")
      .sort({ views: -1 }) // Sort by views in descending order
      .skip(skip)
      .limit(limit);

    // Transform products to include category name
    const transformedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        category: productObj.category?.name || "Uncategorized",
        lastViewed: productObj.lastViewed
          ? new Date(productObj.lastViewed).toLocaleDateString()
          : "Never",
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products/most-viewed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint to increment view count
export async function POST(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { views: 1 },
        $set: { lastViewed: new Date() },
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error in POST /api/admin/products/most-viewed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
