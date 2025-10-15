"use client";

import * as React from "react";
import { Moon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-full hover:bg-secondary"
      aria-label="Toggle theme"
    >
      <Moon className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}