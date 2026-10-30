"use client";

import { useEffect, useRef } from "react";

export function ScrollToEnd({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [count]);

  return <div ref={ref} aria-hidden className="scroll-mb-6" />;
}
