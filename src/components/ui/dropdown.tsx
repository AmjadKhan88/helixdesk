"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownTrigger = Menu.Trigger;
export const DropdownSeparator = (
  p: React.ComponentProps<typeof Menu.Separator>,
) => <Menu.Separator className="-mx-1 my-1 h-px bg-line" {...p} />;

export function DropdownContent({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={6}
        className={cn(
          "z-[60] min-w-44 rounded-xl border border-line bg-surface p-1 shadow-lg shadow-black/10",
          "animate-[pop-in_0.12s_ease-out]",
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

export function DropdownItem({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg-muted outline-none",
        "data-[highlighted]:bg-surface-2 data-[highlighted]:text-fg",
        className,
      )}
      {...props}
    />
  );
}

export const DropdownLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Label>) => (
  <Menu.Label className={cn("px-2.5 py-2", className)} {...props} />
);
