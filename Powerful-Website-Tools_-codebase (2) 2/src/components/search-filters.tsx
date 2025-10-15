"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SearchFiltersProps {
  category: string;
  pricing: string;
  type: string;
  sort: string;
  onFilterChange: (filterType: string, value: string) => void;
}

export function SearchFilters({
  category,
  pricing,
  type,
  sort,
  onFilterChange,
}: SearchFiltersProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Category</h3>
        <RadioGroup value={category} onValueChange={(value) => onFilterChange("category", value)}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="cursor-pointer">All Categories</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="design" id="cat-design" />
            <Label htmlFor="cat-design" className="cursor-pointer">Design</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="development" id="cat-dev" />
            <Label htmlFor="cat-dev" className="cursor-pointer">Development</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="productivity" id="cat-prod" />
            <Label htmlFor="cat-prod" className="cursor-pointer">Productivity</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="marketing" id="cat-market" />
            <Label htmlFor="cat-market" className="cursor-pointer">Marketing</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="ai" id="cat-ai" />
            <Label htmlFor="cat-ai" className="cursor-pointer">AI Tools</Label>
          </div>
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pricing</h3>
        <RadioGroup value={pricing} onValueChange={(value) => onFilterChange("pricing", value)}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="all" id="price-all" />
            <Label htmlFor="price-all" className="cursor-pointer">All Pricing</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="free" id="price-free" />
            <Label htmlFor="price-free" className="cursor-pointer">Free</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="freemium" id="price-freemium" />
            <Label htmlFor="price-freemium" className="cursor-pointer">Freemium</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="paid" id="price-paid" />
            <Label htmlFor="price-paid" className="cursor-pointer">Paid</Label>
          </div>
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Type</h3>
        <RadioGroup value={type} onValueChange={(value) => onFilterChange("type", value)}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="all" id="type-all" />
            <Label htmlFor="type-all" className="cursor-pointer">All Types</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="tool" id="type-tool" />
            <Label htmlFor="type-tool" className="cursor-pointer">Tool</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="website" id="type-website" />
            <Label htmlFor="type-website" className="cursor-pointer">Website</Label>
          </div>
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Sort By</h3>
        <RadioGroup value={sort} onValueChange={(value) => onFilterChange("sort", value)}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="popular" id="sort-popular" />
            <Label htmlFor="sort-popular" className="cursor-pointer">Most Popular</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest" className="cursor-pointer">Newest</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="rating" id="sort-rating" />
            <Label htmlFor="sort-rating" className="cursor-pointer">Highest Rated</Label>
          </div>
        </RadioGroup>
      </Card>
    </div>
  );
}