"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Mail, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        await update();
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b2c]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa509]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c] to-[#0a1854] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden bg-white flex flex-col lg:flex-row animate-fade-in">
        {/* Left side - Form */}
        <div className="lg:w-3/5 p-8 sm:p-12">
          <div className="text-center animate-fade-in animation-delay-200">
            <div className="flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-[#ffa509]" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-[#050b2c]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          <form
            className="mt-8 space-y-6 animate-fade-in animation-delay-300"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-red-50 border-l-4 border-[#c90b0b] text-[#c90b0b] p-4 rounded">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Error:</span> {error}
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div
                className="relative"
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-[#ffa509] transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                className="relative"
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-[#ffa509] transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffa509] shadow-lg shadow-[#ffa509]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/register"
                  className="text-sm font-medium text-[#050b2c] hover:text-[#ffa509] transition-colors"
                >
                  Don&apos;t have an account? Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-2/5 relative bg-gradient-to-br from-[#050b2c] to-[#0a1854]">
          <div className="relative h-full">
            <Image
              src="https://cdn.pixabay.com/photo/2024/06/01/18/18/shoe-8802894_1280.png"
              alt="Stylish Shoe"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b2c] via-[#050b2c]/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
