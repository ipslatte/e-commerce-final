import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";

interface Props {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

async function getCategoryProducts(
  categoryId: string,
  searchParams: Props["searchParams"]
) {
  try {
    const params = new URLSearchParams({
      ...searchParams,
      category: categoryId,
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // First get the category details
  const category = await getCategory(params.slug);

  if (!category) {
    return notFound();
  }

  // Then get the products for this category
  const { products, total } = await getCategoryProducts(
    category._id,
    searchParams
  );

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#050b2c] text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center capitalize">
              {category.name}
            </h1>
            <p className="text-center mt-4 text-gray-300">
              No products found in this category
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#050b2c] text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center capitalize"
          >
            {category.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-4 text-gray-300"
          >
            Discover our amazing collection of {category.name}
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-1/4"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiFilter className="text-[#ffa509]" />
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa509]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa509]"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Sort By</h3>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa509]"
                  defaultValue={searchParams.sort || "newest"}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button className="w-full bg-[#ffa509] text-white py-2 rounded-md hover:bg-opacity-90 transition-colors">
                Apply Filters
              </button>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:w-3/4"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {total} Products Found
                </h2>
              </div>

              <Suspense fallback={<div>Loading products...</div>}>
                <ProductGrid products={products} />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
