"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/namaz") {
      return pathname === "/namaz" || pathname.startsWith("/namaz/") || pathname === "/prayer-times" || pathname.startsWith("/prayer-times/") || pathname === "/namaz-shikkha" || pathname.startsWith("/namaz-shikkha/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-400/20 bg-background/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/55">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-[4.5rem] md:px-6"
        aria-label="Main Navigation"
      >
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="arabic-text text-xl text-amber-500/90 transition group-hover:text-amber-500">نور</span>
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">নূর</span>
        </Link>

        <div className="hidden items-center gap-1.5 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm transition-all duration-300 hover:text-emerald-500",
                isActive(item.href)
                  ? "bg-emerald-600/15 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(6,95,70,0.28)] dark:text-emerald-300"
                  : "text-foreground/75 hover:bg-emerald-500/5",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-emerald-300/30 bg-white/10 backdrop-blur-xl md:hidden"
                aria-label="মেনু খুলুন"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-emerald-400/20 bg-background/95">
              <div className="mt-8 grid gap-2.5">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm",
                      isActive(item.href)
                        ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300"
                        : "text-foreground/80 hover:bg-emerald-500/5",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
