"use client";

import { motion } from "framer-motion";
import { User, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-white/80">Update your personal information</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#050b2c]">
                  Coming Soon
                </h2>
                <p className="text-[#050b2c]/60">
                  Profile settings will be available soon
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
