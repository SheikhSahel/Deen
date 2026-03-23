"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AiQnaWidget } from "@/components/shared/ai-qna-widget";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <AiQnaWidget />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
