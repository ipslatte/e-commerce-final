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

    // Get all products with populated category
    const products = await Product.find().populate("category", "name");

    // Calculate key metrics
    const totalProducts = products.length;
    const totalSales = products.reduce(
      (sum, product) => sum + (product.salesCount || 0),
      0
    );
    const totalRevenue = products.reduce(
      (sum, product) => sum + (product.salesCount || 0) * product.price,
      0
    );
    const averagePrice =
      products.reduce((sum, product) => sum + product.price, 0) / totalProducts;

    // Calculate stock metrics with proper threshold handling
    const outOfStockCount = products.filter(
      (product) => product.stock === 0
    ).length;
    const lowStockCount = products.filter((product) => {
      const threshold = product.lowStockThreshold || 10; // Use default threshold if not set
      return product.stock > 0 && product.stock <= threshold; // Only count products with stock > 0 and <= threshold
    }).length;

    // Calculate category distribution
    const categoryDistribution = products.reduce(
      (acc: { [key: string]: number }, product) => {
        const categoryName = product.category?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate sales trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const salesTrends = {
      labels: last7Days,
      data: last7Days.map(() => Math.floor(Math.random() * 100)), // Placeholder data
    };

    // Get top 5 products by sales
    const topProducts = products
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5);

    // Improved stock level distribution with proper ranges
    const stockRanges = [
      "Out of Stock",
      "Low Stock",
      "11-50",
      "51-100",
      "100+",
    ];
    const stockLevels = {
      labels: stockRanges,
      data: [
        outOfStockCount,
        lowStockCount,
        products.filter((p) => p.stock > 10 && p.stock <= 50).length,
        products.filter((p) => p.stock > 50 && p.stock <= 100).length,
        products.filter((p) => p.stock > 100).length,
      ],
    };

    return NextResponse.json({
      totalProducts,
      totalSales,
      totalRevenue,
      averagePrice,
      lowStockCount,
      outOfStockCount,
      categoryDistribution,
      salesTrends,
      topProducts: {
        labels: topProducts.map((p) => p.name),
        sales: topProducts.map((p) => p.salesCount || 0),
        revenue: topProducts.map((p) => (p.salesCount || 0) * p.price),
      },
      stockLevels,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products/analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
