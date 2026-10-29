"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/components/theme/theme-provider";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--fg)",
          "--normal-border": "var(--line-strong)",
        } as React.CSSProperties
      }
    />
  );
}
