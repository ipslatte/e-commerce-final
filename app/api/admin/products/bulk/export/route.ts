import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all products with populated category information
    const products = await Product.find().populate(
      "category",
      "name attributes"
    );

    // Transform data for export
    const exportData = products.map((product) => {
      const baseData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category?.name || "Uncategorized",
        stock: product.stock,
        coverImage: product.coverImage,
        images: product.images.join(", "),
      };

      // Add attribute columns
      const attributeData: { [key: string]: any } = {};
      if (product.category?.attributes) {
        product.category.attributes.forEach((attrDef: any) => {
          const attrValue = product.attributes?.get(attrDef.name);
          const columnName = `attribute_${attrDef.name}`;

          if (attrValue !== undefined) {
            if (Array.isArray(attrValue)) {
              // Handle multiselect values
              attributeData[columnName] = attrValue.join(", ");
            } else {
              attributeData[columnName] = attrValue;
            }
          } else {
            attributeData[columnName] = "";
          }
        });
      }

      return { ...baseData, ...attributeData };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set("Content-Disposition", 'attachment; filename="products.xlsx"');

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error in bulk export:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
