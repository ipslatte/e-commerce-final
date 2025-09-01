"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Plus,
  Check,
  Trash2,
  Phone,
  Building2,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";

interface Address {
  _id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (!response.ok) throw new Error("Failed to fetch addresses");
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingAddress(true);

    const formData = new FormData(e.currentTarget);
    const addressData = {
      fullName: formData.get("fullName"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
      phone: formData.get("phone"),
      isDefault: formData.get("isDefault") === "true",
    };

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) throw new Error("Failed to add address");

      toast({
        title: "Success",
        description: "Address added successfully",
      });

      await fetchAddresses();
      e.currentTarget.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to set default address");

      toast({
        title: "Success",
        description: "Default address updated",
      });

      await fetchAddresses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete address");

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });

      await fetchAddresses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Add New Address Card */}
        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-2xl border-2 border-dashed border-gray-200 p-6 cursor-pointer hover:border-[#ffa509] transition-all duration-300 flex items-center justify-center min-h-[280px] hover:shadow-lg"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffa509]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ffa509]/20 transition-colors duration-300">
                  <Plus className="w-8 h-8 text-[#ffa509]" />
                </div>
                <h3 className="text-lg font-semibold text-[#050b2c] mb-2">
                  Add New Address
                </h3>
                <p className="text-sm text-gray-500">
                  Click to add a new shipping address
                </p>
              </div>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[#050b2c] flex items-center text-xl">
                <MapPin className="w-5 h-5 mr-2 text-[#ffa509]" />
                Add New Address
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-[#050b2c]">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addressLine1" className="text-[#050b2c]">
                    Address Line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    required
                    className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addressLine2" className="text-[#050b2c]">
                    Address Line 2 (Optional)
                  </Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city" className="text-[#050b2c]">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state" className="text-[#050b2c]">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      required
                      className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode" className="text-[#050b2c]">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      required
                      className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country" className="text-[#050b2c]">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      required
                      className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-[#050b2c]">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    value="true"
                    className="h-4 w-4 rounded border-gray-300 text-[#ffa509] focus:ring-[#ffa509]"
                  />
                  <Label htmlFor="isDefault" className="text-[#050b2c]">
                    Set as default address
                  </Label>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isAddingAddress}
                className="w-full bg-gradient-to-r from-[#050b2c] to-[#0a1854] hover:shadow-lg transition-all duration-300"
              >
                {isAddingAddress ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Address Cards */}
        {addresses.map((address, index) => (
          <motion.div
            key={address._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex gap-2">
              {address.isDefault && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#050b2c] to-[#0a1854] text-white">
                  Default
                </span>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ffa509]/10 flex items-center justify-center flex-shrink-0">
                  {address.isDefault ? (
                    <Home className="w-5 h-5 text-[#ffa509]" />
                  ) : (
                    <Building2 className="w-5 h-5 text-[#ffa509]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#050b2c] mb-2 truncate">
                    {address.fullName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <div className="flex items-center gap-2 text-[#050b2c]">
                      <Phone className="w-4 h-4" />
                      <span>{address.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {!address.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(address._id)}
                    variant="outline"
                    className="flex-1 border-[#ffa509] text-[#ffa509] hover:bg-[#ffa509] hover:text-white transition-colors duration-300"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Set Default
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(address._id)}
                  variant="outline"
                  className="border-[#c90b0b] text-[#c90b0b] hover:bg-[#c90b0b] hover:text-white transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
