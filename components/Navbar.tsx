"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiHome,
  FiGrid,
  FiTag,
  FiZap,
  FiSearch,
  FiPhone,
  FiClock,
  FiUser,
  FiLogIn,
} from "react-icons/fi";
import { useCart } from "@/providers/cart-provider";
import { usePathname, useRouter } from "next/navigation";
import CountdownTimer from "./CountdownTimer";
import { useSession } from "next-auth/react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  subItems?: { label: string; href: string }[];
}

interface FlashSale {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const Navbar = () => {
  const { cart } = useCart();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeFlashSale, setActiveFlashSale] = useState<FlashSale | null>(
    null
  );
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        // Ensure data is an array before using slice
        if (!Array.isArray(data)) {
          console.error("Categories data is not an array:", data);
          setCategories([]);
          setTopCategories([]);
          return;
        }

        setCategories(data);
        setTopCategories(data.length > 0 ? data.slice(0, 3) : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setTopCategories([]);
      }
    };

    const fetchActiveFlashSale = async () => {
      try {
        const response = await fetch("/api/flash-sales/active");
        const data = await response.json();
        if (data && data.length > 0) {
          setActiveFlashSale(data[0]);
        }
      } catch (error) {
        console.error("Error fetching flash sales:", error);
      }
    };

    fetchCategories();
    fetchActiveFlashSale();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set("search", searchQuery);
    if (selectedCategory) searchParams.set("category", selectedCategory);
    router.push(`/products?${searchParams.toString()}`);
  };

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <FiHome className="mr-2" />,
    },
    {
      label: "Flash Sales",
      href: "/flash-sales",
      icon: <FiZap className="mr-2" />,
    },
    {
      label: "All Categories",
      href: "/products",
      icon: <FiGrid className="mr-2" />,
      subItems: categories.map((category) => ({
        label: category.name,
        href: `/products?category=${category._id}`,
      })),
    },
    ...topCategories.map((category) => ({
      label: category.name,
      href: `/products?category=${category._id}`,
      icon: <FiTag className="mr-2" />,
    })),
  ];

  const cartItemsCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleDropdownClick = (label: string, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <div className="bg-[#050b2c] relative z-50">
      {/* Flash Sale Banner */}
      <AnimatePresence>
        {activeFlashSale && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white relative z-40"
          >
            <div className="container mx-auto px-4">
              <div className="py-2.5 flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <FiZap className="w-5 h-5 text-yellow-300" />
                  <span className="text-white text-base hidden md:inline">
                    Flash Sale:
                  </span>
                  <span className="font-bold text-yellow-300">
                    {activeFlashSale.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-yellow-300" />
                  <span className="hidden sm:inline text-white/80">
                    Ends in:
                  </span>
                  <div className="flex items-center gap-2">
                    <CountdownTimer endDate={activeFlashSale.endDate} />
                  </div>
                </div>
                <Link
                  href="/flash-sales"
                  className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-full transition-colors font-semibold"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar with Search */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="py-2.5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Hotline */}
              <div className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-[#ffa509]" />
                <span className="text-sm text-white/90">
                  Hotline:{" "}
                  <span className="text-[#ffa509] font-medium">
                    1-800-123-4567
                  </span>{" "}
                  (24/7 Support)
                </span>
              </div>

              {/* Search Bar */}
              <div className="flex-1 lg:max-w-2xl">
                <form onSubmit={handleSearch} className="flex">
                  <div className="flex-1 flex">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 bg-white text-gray-800 rounded-l-md border-r border-gray-300 focus:outline-none text-sm w-32 md:w-auto"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-4 py-2 focus:outline-none text-sm"
                      />
                      <button
                        type="submit"
                        className="absolute right-0 top-0 bottom-0 px-4 bg-[#ffa509] text-white rounded-r-md hover:bg-opacity-90 transition-colors"
                      >
                        <FiSearch className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-800 relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.h1
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold text-[#ffa509]"
              >
                E-Store
              </motion.h1>
            </Link>

            {/* Desktop Navigation */}
            <div
              className="hidden md:flex items-center space-x-8"
              ref={dropdownRef}
            >
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.subItems ? (
                    <button
                      className={`flex items-center text-gray-300 hover:text-white transition-colors ${
                        pathname === item.href ? "text-white" : ""
                      }`}
                    >
                      {item.icon}
                      {item.label}
                      <FiChevronDown
                        className={`ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center text-gray-300 hover:text-white transition-colors ${
                        pathname === item.href ? "text-white" : ""
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}

                  {item.subItems && (
                    <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-md shadow-lg py-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auth and Cart Links */}
            <div className="hidden md:flex items-center space-x-6">
              {status === "loading" ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#ffa509] border-t-transparent animate-spin" />
              ) : status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  <FiUser className="w-5 h-5 mr-1" />
                  {session.user?.name || "Dashboard"}
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <FiLogIn className="w-5 h-5 mr-1" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center bg-[#ffa509] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    <FiUser className="w-5 h-5 mr-1" />
                    Register
                  </Link>
                </div>
              )}

              <Link
                href="/cart"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <div className="relative">
                  <FiShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ffa509] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <Link
                href="/cart"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <div className="relative">
                  <FiShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ffa509] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {isOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#050b2c] border-t border-gray-800"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors ${
                        pathname === item.href ? "text-white" : ""
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        {item.label}
                      </div>
                    </Link>
                  </div>
                ))}
                {/* Mobile Auth Links */}
                {status === "loading" ? (
                  <div className="px-3 py-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#ffa509] border-t-transparent animate-spin" />
                  </div>
                ) : status === "authenticated" ? (
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center">
                      <FiUser className="w-5 h-5 mr-2" />
                      {session.user?.name || "Dashboard"}
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center">
                        <FiLogIn className="w-5 h-5 mr-2" />
                        Login
                      </div>
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center">
                        <FiUser className="w-5 h-5 mr-2" />
                        Register
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
