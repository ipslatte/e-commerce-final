import { FlashSale } from "@/types";

export interface ProductPrice {
  originalPrice: number;
  finalPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  hasFlashSale: boolean;
  flashSale?: FlashSale;
}

export async function getProductPrice(
  productId: string
): Promise<ProductPrice> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    // Fetch product and flash sale data in parallel
    const [productRes, flashSaleRes] = await Promise.all([
      fetch(`${baseUrl}/api/products/${productId}`),
      fetch(`${baseUrl}/api/products/${productId}/flash-sale`),
    ]);

    if (!productRes.ok) {
      throw new Error("Failed to fetch product");
    }

    const product = await productRes.json();
    const originalPrice = product.price;

    // If no flash sale or failed to fetch, return original price
    if (!flashSaleRes.ok) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        hasFlashSale: false,
      };
    }

    const flashSale = await flashSaleRes.json();

    // If no active flash sale, return original price
    if (!flashSale || !flashSale.discountValue) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        hasFlashSale: false,
      };
    }

    const discountValue = Number(flashSale.discountValue);
    let finalPrice = originalPrice;
    let discountAmount = 0;
    let discountPercentage = 0;

    if (flashSale.discountType === "percentage") {
      discountPercentage = discountValue;
      discountAmount = (originalPrice * discountValue) / 100;
      finalPrice = originalPrice * (1 - discountValue / 100);
    } else {
      discountAmount = discountValue;
      discountPercentage = (discountValue / originalPrice) * 100;
      finalPrice = Math.max(0, originalPrice - discountValue);
    }

    return {
      originalPrice,
      finalPrice,
      discountPercentage,
      discountAmount,
      hasFlashSale: true,
      flashSale,
    };
  } catch (error) {
    console.error("Error calculating product price:", error);
    // Try to get the product price directly
    try {
      const productRes = await fetch(`${baseUrl}/api/products/${productId}`);
      if (productRes.ok) {
        const product = await productRes.json();
        return {
          originalPrice: product.price,
          finalPrice: product.price,
          hasFlashSale: false,
        };
      }
    } catch (e) {
      console.error("Failed to fetch product price:", e);
    }
    throw new Error("Failed to calculate product price");
  }
}

export function calculateDiscountedPrice(
  price: number,
  flashSale?: FlashSale | null
): number {
  if (!flashSale || !price) return price;

  const discountValue = Number(flashSale.discountValue);

  if (flashSale.discountType === "percentage") {
    return price * (1 - discountValue / 100);
  }
  return Math.max(0, price - discountValue);
}
