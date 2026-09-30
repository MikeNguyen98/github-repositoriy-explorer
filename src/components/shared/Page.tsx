import { cn } from "cn";
import type { ReactNode } from "react";

/** Standard page container so every route shares the same width and gutters. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)}>
      {children}
    </div>
  );
}
