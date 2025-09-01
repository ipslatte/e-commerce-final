import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

// GET /api/admin/products - Get all products with filtering and pagination
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

    // Build filter query
    const filterQuery: any = {};
    const categoryName = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const stock = searchParams.get("stock");

    if (categoryName) {
      // Find category by name and use its ID in the query
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        filterQuery.category = category._id;
      }
    }

    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice) filterQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) filterQuery.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filterQuery.$text = { $search: search };
    }

    // Add stock filter
    if (stock !== null) {
      filterQuery.stock = parseInt(stock);
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(total / limit);

    // Get products with populated category
    const products = await Product.find(filterQuery)
      .populate("category", "name slug attributes")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform products to include category name
    const transformedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        category: productObj.category?.name || "Uncategorized",
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.coverImage) {
      return NextResponse.json(
        { error: "Cover image is required" },
        { status: 400 }
      );
    }

    // Ensure images is an array
    const productData = {
      ...body,
      images: body.images || [], // Default to empty array if not provided
    };

    const product = await Product.create(productData);

    // Populate category information before sending response
    await product.populate("category", "name slug attributes");

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/products:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
