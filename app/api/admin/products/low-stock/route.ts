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

    // Find products where stock is less than or equal to lowStockThreshold
    // and ensure lowStockThreshold exists (default is 10 if not set)
    const query = {
      $or: [
        {
          $and: [
            { lowStockThreshold: { $exists: true } },
            {
              $expr: {
                $lte: ["$stock", "$lowStockThreshold"],
              },
            },
          ],
        },
        {
          $and: [
            { lowStockThreshold: { $exists: false } },
            { stock: { $lte: 10 } }, // Default threshold
          ],
        },
      ],
    };

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get products with populated category
    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ stock: 1 }) // Sort by stock level ascending
      .skip(skip)
      .limit(limit);

    // Transform products to include category name and stock status
    const transformedProducts = products.map((product) => {
      const productObj = product.toObject();
      const threshold = productObj.lowStockThreshold || 10; // Use default if not set
      return {
        ...productObj,
        category: productObj.category?.name || "Uncategorized",
        stockStatus: productObj.stock === 0 ? "Out of Stock" : "Low Stock",
        stockPercentage: Math.round((productObj.stock / threshold) * 100),
        lowStockThreshold: productObj.lowStockThreshold || 10, // Ensure threshold is always set
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products/low-stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update low stock threshold
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { productId, lowStockThreshold } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          lowStockThreshold:
            lowStockThreshold !== undefined ? lowStockThreshold : undefined,
        },
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error in PUT /api/admin/products/low-stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
