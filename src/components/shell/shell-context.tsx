"use client";

import { createContext, useContext, useState } from "react";

const ShellContext = createContext<{
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
} | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <ShellContext value={{ navOpen, setNavOpen }}>{children}</ShellContext>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}
