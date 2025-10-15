"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface QuantitySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number) => void;
  productName: string;
  pricePerUnit: number;
}

export function QuantitySelectionDialog({
  open,
  onOpenChange,
  onConfirm,
  productName,
  pricePerUnit,
}: QuantitySelectionDialogProps) {
  const [quantity, setQuantity] = React.useState(1);

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setQuantity(num);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 100) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    onOpenChange(false);
  };

  const totalPrice = (pricePerUnit * quantity) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Select Quantity
          </DialogTitle>
          <DialogDescription>
            How many {productName.toLowerCase()} submissions would you like to purchase?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-center text-lg font-semibold h-12 w-24"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= 100}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum 100 submissions per purchase
            </p>
          </div>

          {/* Price Summary */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per submission</span>
              <span className="font-medium">${(pricePerUnit / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium">×{quantity}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
          >
            Continue to Checkout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}