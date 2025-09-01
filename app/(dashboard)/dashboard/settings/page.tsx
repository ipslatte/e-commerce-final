"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User, Lock, Bell, Shield, ChevronRight, Wallet } from "lucide-react";

const settingsCategories = [
  {
    title: "Profile Settings",
    description: "Update your personal information and preferences",
    icon: User,
    href: "/dashboard/settings/profile",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Security",
    description: "Manage your password and security settings",
    icon: Lock,
    href: "/dashboard/settings/security",
    gradient: "from-[#ffa509] to-[#ff8c00]",
  },
  {
    title: "Notifications",
    description: "Configure your notification preferences",
    icon: Bell,
    href: "/dashboard/settings/notifications",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "Privacy",
    description: "Control your privacy settings and data",
    icon: Shield,
    href: "/dashboard/settings/privacy",
    gradient: "from-green-500 to-green-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-white/80">
            Manage your account preferences and security
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {settingsCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={category.href}>
                  <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#050b2c]/5 via-transparent to-[#ffa509]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-r ${category.gradient} text-white shadow-lg`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors duration-300">
                            {category.title}
                          </h3>
                          <p className="text-[#050b2c]/60 mt-1">
                            {category.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ffa509] transition-colors duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#050b2c] mb-4">
              Quick Actions
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-[#050b2c]/5 hover:bg-[#050b2c]/10 transition-colors duration-300">
                <Wallet className="h-5 w-5 text-[#050b2c]" />
                <span className="text-[#050b2c] font-medium">
                  Manage Billing
                </span>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-xl bg-[#ffa509]/10 hover:bg-[#ffa509]/20 transition-colors duration-300">
                <Shield className="h-5 w-5 text-[#ffa509]" />
                <span className="text-[#ffa509] font-medium">
                  Privacy Check
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
