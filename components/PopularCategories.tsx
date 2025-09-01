"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FiHome,
  FiHeadphones,
  FiMonitor,
  FiSmartphone,
  FiCoffee,
  FiPrinter,
  FiTv,
  FiWifi,
  FiBox,
  FiCpu,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { MdKitchen } from "react-icons/md";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Map of category names to icons
const categoryIcons: { [key: string]: JSX.Element } = {
  Electronics: <FiMonitor className="w-8 h-8" />,
  Appliances: <FiHome className="w-8 h-8" />,
  Kitchen: <MdKitchen className="w-8 h-8" />,
  Audio: <FiHeadphones className="w-8 h-8" />,
  "Smart Home": <FiWifi className="w-8 h-8" />,
  Game: <IoGameControllerOutline className="w-8 h-8" />,
  Office: <FiPrinter className="w-8 h-8" />,
  Mobile: <FiSmartphone className="w-8 h-8" />,
  TV: <FiTv className="w-8 h-8" />,
  Computers: <FiCpu className="w-8 h-8" />,
  Other: <FiBox className="w-8 h-8" />,
};

// Background colors for category circles
const bgColors = [
  "bg-yellow-400",
  "bg-emerald-400",
  "bg-red-400",
  "bg-blue-400",
  "bg-orange-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-indigo-400",
  "bg-teal-400",
];

function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
      style={{ right: "-40px" }}
    >
      <FiChevronRight className="w-6 h-6 text-gray-600" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
      style={{ left: "-40px" }}
    >
      <FiChevronLeft className="w-6 h-6 text-gray-600" />
    </button>
  );
}

export default function PopularCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Popular Categories
        </motion.h2>

        <div className="relative px-10">
          <Slider {...settings}>
            {categories.map((category, index) => (
              <div key={category._id} className="px-2">
                <Link
                  href={`/products?category=${category._id}`}
                  className="text-center block group"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`w-20 h-20 mx-auto rounded-full ${
                        bgColors[index % bgColors.length]
                      } flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 text-white`}
                    >
                      {categoryIcons[category.name] || categoryIcons["Other"]}
                    </div>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-sm text-gray-800 font-medium block text-center"
                    >
                      {category.name}
                    </motion.span>
                  </motion.div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
