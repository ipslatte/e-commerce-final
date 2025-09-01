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
    const type = searchParams.get("type") || "best"; // 'best' or 'worst'
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    // Sort by sales in ascending (worst) or descending (best) order
    const sortOrder = type === "best" ? -1 : 1;

    // Get products sorted by sales
    const products = await Product.find()
      .populate("category", "name")
      .sort({ salesCount: sortOrder }) // Assuming we have a salesCount field
      .skip(skip)
      .limit(limit);

    // Transform products to include category name
    const transformedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        category: productObj.category?.name || "Uncategorized",
        salesCount: productObj.salesCount || 0,
        revenue: (productObj.salesCount || 0) * productObj.price,
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products/sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
