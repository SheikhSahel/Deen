"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder on server and during initial hydration to avoid mismatch
  // Use system theme preference as fallback (preferred-color-scheme)
  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="থিম পরিবর্তন করুন"
          className="border-emerald-300/40 bg-white/10 backdrop-blur-xl"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="থিম পরিবর্তন করুন"
        className="border-emerald-300/40 bg-white/10 backdrop-blur-xl"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}
