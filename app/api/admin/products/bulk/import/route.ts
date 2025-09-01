import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Get all categories and create a map for quick lookup
    const existingCategories = await Category.find({}, "name attributes");
    const categoryMap = new Map(
      existingCategories.map((cat) => [cat.name, cat])
    );

    // Create missing categories
    const uniqueCategories = new Set(jsonData.map((row: any) => row.category));
    for (const categoryName of uniqueCategories) {
      if (!categoryMap.has(categoryName)) {
        // Create new category with basic structure
        const newCategory = await Category.create({
          name: categoryName,
          description: `Category for ${categoryName} products`,
          attributes: [], // Start with no attributes
        });
        categoryMap.set(categoryName, newCategory);
        console.log(`Created new category: ${categoryName}`);
      }
    }

    // Validate and transform data
    const products = await Promise.all(
      jsonData.map(async (row: any) => {
        // Get category (we know it exists now)
        const category = categoryMap.get(row.category);

        // Parse attributes from the Excel file
        const attributes = new Map();
        if (category.attributes && category.attributes.length > 0) {
          category.attributes.forEach((attrDef: any) => {
            const attrValue = row[`attribute_${attrDef.name}`];
            if (attrDef.required && attrValue === undefined) {
              throw new Error(
                `Required attribute "${attrDef.name}" is missing for product "${row.name}"`
              );
            }
            if (attrValue !== undefined) {
              // Convert value based on attribute type
              let parsedValue = attrValue;
              switch (attrDef.type) {
                case "number":
                  parsedValue = Number(attrValue);
                  if (isNaN(parsedValue)) {
                    throw new Error(
                      `Invalid number value for attribute "${attrDef.name}" in product "${row.name}"`
                    );
                  }
                  break;
                case "boolean":
                  parsedValue = String(attrValue).toLowerCase() === "true";
                  break;
                case "select":
                  if (!attrDef.options.includes(attrValue)) {
                    throw new Error(
                      `Invalid option "${attrValue}" for attribute "${attrDef.name}" in product "${row.name}"`
                    );
                  }
                  break;
                case "multiselect":
                  parsedValue = String(attrValue)
                    .split(",")
                    .map((v: string) => v.trim());
                  const invalidOptions = parsedValue.filter(
                    (v: string) => !attrDef.options.includes(v)
                  );
                  if (invalidOptions.length > 0) {
                    throw new Error(
                      `Invalid options "${invalidOptions.join(
                        ", "
                      )}" for attribute "${attrDef.name}" in product "${
                        row.name
                      }"`
                    );
                  }
                  break;
              }
              attributes.set(attrDef.name, parsedValue);
            }
          });
        }

        return {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          category: category._id,
          stock: parseInt(row.stock),
          coverImage: row.coverImage || "https://via.placeholder.com/150",
          images: row.images
            ? row.images.split(",").map((url: string) => url.trim())
            : [],
          attributes,
        };
      })
    );

    // Insert products
    const result = await Product.insertMany(products, { ordered: false });

    return NextResponse.json({
      message: `Successfully imported ${result.length} products. ${
        uniqueCategories.size - existingCategories.length
      } new categories were created.`,
      count: result.length,
    });
  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import products",
      },
      { status: 500 }
    );
  }
}
