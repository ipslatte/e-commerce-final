"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

interface ProductAttributes {
  [key: string]: string | string[];
}

interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: {
    [key: string]: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  coverImage: string;
  stock: number;
  attributes?: ProductAttributes;
}

interface CartItem {
  _id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedAttributes?: Record<string, string>;
  flashSale?: {
    id: string;
    discountType: string;
    discountValue: number;
  };
}

interface Cart {
  _id: string;
  items: CartItem[];
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (
    product: Product,
    quantity: number,
    variant?: ProductVariant,
    selectedAttributes?: Record<string, string>,
    flashSale?: {
      id: string;
      discountType: string;
      discountValue: number;
    }
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  isLoading: true,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: () => {},
});

const CART_STORAGE_KEY = "ecommerce_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = async (
    product: Product,
    quantity: number,
    variant?: ProductVariant,
    selectedAttributes?: Record<string, string>,
    flashSale?: {
      id: string;
      discountType: string;
      discountValue: number;
    }
  ) => {
    setCart((prevCart) => {
      const newCart: Cart = prevCart || {
        _id: "local_cart",
        items: [],
        updatedAt: new Date().toISOString(),
      };

      const existingItemIndex = newCart.items.findIndex(
        (item) =>
          item.product._id === product._id &&
          (!variant ? !item.variant : item.variant?._id === variant._id) &&
          JSON.stringify(item.selectedAttributes) ===
            JSON.stringify(selectedAttributes)
      );

      if (existingItemIndex > -1) {
        // Update existing item
        newCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = {
          _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          product,
          quantity,
          variant,
          selectedAttributes,
          flashSale,
        };
        newCart.items.push(newItem);
      }

      newCart.updatedAt = new Date().toISOString();
      return { ...newCart };
    });
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setCart((prevCart) => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      );

      return {
        ...prevCart,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const removeFromCart = async (itemId: string) => {
    setCart((prevCart) => {
      if (!prevCart) return null;

      return {
        ...prevCart,
        items: prevCart.items.filter((item) => item._id !== itemId),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const clearCart = () => {
    setCart(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
