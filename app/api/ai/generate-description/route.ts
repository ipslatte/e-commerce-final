import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { productName, category } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    // Create a prompt for generating product description
    const prompt = `Generate a detailed, professional product description for an e-commerce website using the following structured format. Avoid using any special characters or symbols:

    Product: ${productName}
    Category: ${category || "General"}
    
    Format the description as follows (use plain text without special characters):

    HEADLINE:
    Create an attention-grabbing headline that highlights the product's main value proposition.

    INTRODUCTION:
    Write a compelling opening paragraph that introduces the product and its core benefits.

    KEY FEATURES AND BENEFITS:
    1. Feature One: Description
    2. Feature Two: Description
    3. Feature Three: Description
    4. Feature Four: Description
    5. Feature Five: Description

    UNIQUE SELLING POINTS:
    1. First USP: Description
    2. Second USP: Description
    3. Third USP: Description

    TARGET AUDIENCE:
    1. First target audience group
    2. Second target audience group
    3. Third target audience group
    4. Fourth target audience group

    USE CASES:
    1. First use case scenario
    2. Second use case scenario
    3. Third use case scenario
    4. Fourth use case scenario

    TECHNICAL SPECIFICATIONS:
    1. First specification detail
    2. Second specification detail
    3. Third specification detail
    4. Fourth specification detail

    CALL TO ACTION:
    End with a compelling statement encouraging purchase.

    Important: Use only alphanumeric characters, periods, commas, and basic punctuation. Avoid special characters, markdown syntax, or any symbols that might cause issues with database storage.`;

    // Generate content using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Clean the response text to remove any remaining special characters
    const description = response
      .text()
      .replace(/[^\w\s.,!?():\n-]/g, "") // Remove any special characters except basic punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
