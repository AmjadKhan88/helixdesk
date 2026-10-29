"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/dropdown";

export type MenuOption = {
  value: string;
  label: string;
  leading?: React.ReactNode;
};

export function PropertyMenu({
  label,
  current,
  options,
  onChange,
  disabled,
}: {
  label: string;
  current: MenuOption;
  options: MenuOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownTrigger
        disabled={disabled}
        aria-label={`${label}: ${current.label}. Change`}
        className="inline-flex h-8 max-w-full items-center gap-2 rounded-lg border border-line-strong bg-surface px-2.5 text-[13px] transition-colors hover:bg-surface-2 data-[state=open]:bg-surface-2 disabled:opacity-50"
      >
        <span className="text-fg-subtle">{label}</span>
        {current.leading}
        <span className="truncate font-medium text-fg">{current.label}</span>
        <ChevronDown className="size-3.5 shrink-0 text-fg-subtle" />
      </DropdownTrigger>
      <DropdownContent
        align="start"
        className="max-h-72 min-w-52 overflow-y-auto"
      >
        {options.map((o) => (
          <DropdownItem key={o.value} onSelect={() => onChange(o.value)}>
            {o.leading}
            <span className="truncate">{o.label}</span>
            {o.value === current.value && (
              <Check className="ml-auto size-4 shrink-0 text-brand" />
            )}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownMenu>
  );
}
