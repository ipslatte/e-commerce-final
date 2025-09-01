export interface FlashSale {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: {
    [key: string]: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  stock: number;
  rating?: number;
  numReviews?: number;
  coverImage: string;
  category: {
    _id: string;
    name: string;
  };
  variants?: ProductVariant[];
  attributes?: {
    [key: string]: string | string[];
  };
  views?: number;
  lastViewed?: string;
}
