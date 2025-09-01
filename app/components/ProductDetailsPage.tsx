import { useState } from "react";
import { Product } from "@/types/product";

interface ProductDetailsPageProps {
  product: Product;
}

export default function ProductDetailsPage({
  product,
}: ProductDetailsPageProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string;
  }>({});

  const handleAttributeSelect = (name: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function getColorStyle(
    color: string
  ):
    | { backgroundColor: string }
    | { backgroundColor: string; backgroundImage: string } {
    color = color.toLowerCase().trim();

    // Handle metallic colors with gradients
    if (color === "gold") {
      return {
        backgroundColor: "#FFD700",
        backgroundImage: "linear-gradient(45deg, #FFD700, #FDB931, #FFD700)",
      };
    }
    if (color === "silver") {
      return {
        backgroundColor: "#C0C0C0",
        backgroundImage: "linear-gradient(45deg, #C0C0C0, #E8E8E8, #C0C0C0)",
      };
    }
    if (color === "bronze") {
      return {
        backgroundColor: "#CD7F32",
        backgroundImage: "linear-gradient(45deg, #CD7F32, #E6B17F, #CD7F32)",
      };
    }

    // Handle basic colors
    const colorMap: { [key: string]: string } = {
      black: "#000000",
      white: "#FFFFFF",
      red: "#FF0000",
      blue: "#0000FF",
      green: "#008000",
      yellow: "#FFFF00",
      purple: "#800080",
      pink: "#FFC0CB",
      orange: "#FFA500",
      brown: "#A52A2A",
      gray: "#808080",
    };

    return {
      backgroundColor: colorMap[color] || color,
    };
  }

  function isColorAttribute(name: string): boolean {
    const colorAttributes = ["color", "colour", "colors", "colours"];
    return colorAttributes.includes(name.toLowerCase().trim());
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product attributes section */}
      {product.attributes &&
        Object.entries(product.attributes).map(([name, values]) => (
          <div key={name} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 capitalize">{name}</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(values)
                ? values.map((value, index) =>
                    isColorAttribute(name) ? (
                      <button
                        key={index}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${
                      selectedAttributes[name] === value
                        ? "ring-2 ring-offset-2 ring-ffa509 scale-110"
                        : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                    }`}
                        style={getColorStyle(value)}
                        onClick={() => handleAttributeSelect(name, value)}
                        title={value}
                      >
                        <span className="sr-only">{value}</span>
                      </button>
                    ) : (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-md border transition-all duration-200
                    ${
                      selectedAttributes[name] === value
                        ? "bg-ffa509 text-white border-ffa509"
                        : "border-gray-300 hover:border-ffa509"
                    }`}
                        onClick={() => handleAttributeSelect(name, value)}
                      >
                        {value}
                      </button>
                    )
                  )
                : null}
            </div>
          </div>
        ))}
    </div>
  );
}
