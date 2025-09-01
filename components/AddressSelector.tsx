"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { FiMapPin, FiPlus, FiCheck } from "react-icons/fi";
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

interface AddressSelectorProps {
  onAddressSelect: (address: Address) => void;
  selectedAddressId?: string;
}

export default function AddressSelector({
  onAddressSelect,
  selectedAddressId,
}: AddressSelectorProps) {
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

      // If there's a default address and no address is selected, select it
      if (!selectedAddressId && data.length > 0) {
        const defaultAddress = data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          onAddressSelect(defaultAddress);
        }
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffa509]"></div>
          <p className="text-gray-500">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={address._id}
            className={`relative rounded-lg border-2 p-5 cursor-pointer transition-all ${
              selectedAddressId === address._id
                ? "border-[#ffa509] bg-orange-50"
                : "border-gray-200 hover:border-[#ffa509] hover:shadow-md"
            }`}
            onClick={() => onAddressSelect(address)}
          >
            {selectedAddressId === address._id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-[#ffa509] flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            {address.isDefault && (
              <span className="absolute top-4 right-4 bg-[#050b2c] text-white text-xs font-medium px-2.5 py-1 rounded">
                Default
              </span>
            )}
            <div className="space-y-3">
              <div className="flex items-start">
                <FiMapPin className="w-5 h-5 text-[#ffa509] mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#050b2c]">
                    {address.fullName}
                  </p>
                  <div className="mt-1 text-gray-600 space-y-1">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <p className="text-[#050b2c] font-medium">
                      {address.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Address Button */}
        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-lg border-2 border-dashed border-gray-200 p-5 cursor-pointer hover:border-[#ffa509] transition-colors flex items-center justify-center min-h-[200px]"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <FiPlus className="w-6 h-6 text-[#ffa509]" />
                </div>
                <p className="text-[#050b2c] font-medium">Add New Address</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click to add a new shipping address
                </p>
              </div>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[#050b2c] flex items-center">
                <FiMapPin className="w-5 h-5 mr-2 text-[#ffa509]" />
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
                className="w-full bg-[#050b2c] hover:bg-opacity-90 text-white"
              >
                {isAddingAddress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Address...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Address
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
