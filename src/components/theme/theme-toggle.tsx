"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useTheme, type Theme } from "./theme-provider";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          {/* CSS decides which icon shows, so there's no hydration mismatch */}
          <Sun className="size-[18px] dark:hidden" />
          <Moon className="hidden size-[18px] dark:block" />
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownItem key={value} onSelect={() => setTheme(value)}>
            <Icon className="size-4" />
            {label}
            {theme === value && <Check className="ml-auto size-4 text-brand" />}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownMenu>
  );
}
