"use client";

import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/settings/security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
          <p className="text-white/80">
            Update your password and security preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
        >
          <div className="p-8 space-y-6">
            {/* Password Requirements Notice */}
            <div className="bg-[#050b2c]/5 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#050b2c] mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[#050b2c]">
                  Password Requirements
                </h3>
                <p className="text-sm text-[#050b2c]/70 mt-1">
                  Password must be at least 8 characters long and should include
                  a mix of letters, numbers, and special characters.
                </p>
              </div>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#050b2c] text-white rounded-xl font-medium hover:bg-[#050b2c]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
