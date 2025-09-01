"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Tag, Zap, DollarSign, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface PromotionsStats {
  activeCoupons: number;
  activeFlashSales: number;
  totalSavings: number;
}

export default function PromotionsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<PromotionsStats>({
    activeCoupons: 0,
    activeFlashSales: 0,
    totalSavings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    if (session?.user?.role !== "admin") {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/promotions/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-[#ffa509]/10 rounded-lg">
            <Tag className="h-6 w-6 text-[#ffa509]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#050b2c]">Promotions</h2>
            <p className="text-[#050b2c]/60">
              Manage your store promotions and discounts
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            asChild
            className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-lg shadow-[#ffa509]/20 transition-all duration-300"
          >
            <Link href="/dashboard/admin/promotions/coupons/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-[#050b2c] to-[#0a1854] hover:from-[#0a1854] hover:to-[#050b2c] text-white border-none shadow-lg shadow-[#050b2c]/20 transition-all duration-300"
          >
            <Link href="/dashboard/admin/promotions/flash-sales/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Flash Sale
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/50 p-1 border border-[#050b2c]/10 rounded-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#050b2c] data-[state=active]:text-white rounded-md transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="data-[state=active]:bg-[#050b2c] data-[state=active]:text-white rounded-md transition-all duration-300"
            >
              <Link href="/dashboard/admin/promotions/coupons">Coupons</Link>
            </TabsTrigger>
            <TabsTrigger
              value="flash-sales"
              className="data-[state=active]:bg-[#050b2c] data-[state=active]:text-white rounded-md transition-all duration-300"
            >
              <Link href="/dashboard/admin/promotions/flash-sales">
                Flash Sales
              </Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-none bg-gradient-to-br from-[#050b2c] to-[#0a1854] text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-80 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Active Coupons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.activeCoupons}
                    </div>
                    <Button
                      variant="link"
                      className="text-white opacity-80 hover:opacity-100 p-0 h-auto"
                      asChild
                    >
                      <Link href="/dashboard/admin/promotions/coupons">
                        View all coupons →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-none bg-gradient-to-br from-[#ffa509] to-[#ff8c00] text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-80 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Active Flash Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.activeFlashSales}
                    </div>
                    <Button
                      variant="link"
                      className="text-white opacity-80 hover:opacity-100 p-0 h-auto"
                      asChild
                    >
                      <Link href="/dashboard/admin/promotions/flash-sales">
                        View all flash sales →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-none bg-gradient-to-br from-[#050b2c] to-[#0a1854] text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-80 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${stats.totalSavings.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
