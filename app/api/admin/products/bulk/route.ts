import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { operation, productIds, value } = await request.json();

    if (!operation || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case "update-price":
        if (!value || isNaN(parseFloat(value))) {
          return NextResponse.json(
            { error: "Invalid price value" },
            { status: 400 }
          );
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { price: parseFloat(value) } }
        );
        break;

      case "update-stock":
        if (!value || isNaN(parseInt(value))) {
          return NextResponse.json(
            { error: "Invalid stock value" },
            { status: 400 }
          );
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { stock: parseInt(value) } }
        );
        break;

      case "categorize":
        if (!value) {
          return NextResponse.json(
            { error: "Category is required" },
            { status: 400 }
          );
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { category: value } }
        );
        break;

      case "delete":
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: "Bulk operation completed successfully",
      result,
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
