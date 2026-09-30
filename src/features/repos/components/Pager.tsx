import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { getPageRange } from "@/libs/utils";
import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router";

interface PagerProps {
  page: number;
  totalPages: number;
}

/** Numbered pagination backed by real links, so pages are shareable and middle-clickable. */
export function Pager({ page, totalPages }: PagerProps) {
  const { search } = useLocation();
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(search);
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  const edge = (target: number, disabled: boolean, label: string, next: boolean) =>
    disabled ? (
      <span
        aria-disabled
        className={cn(buttonVariants({ variant: "ghost" }), "pointer-events-none opacity-50")}
      >
        {!next && <ChevronLeft />}
        <span className="hidden sm:inline">{label}</span>
        {next && <ChevronRight />}
      </span>
    ) : (
      <Link
        to={hrefFor(target)}
        aria-label={`Go to ${label.toLowerCase()} page`}
        className={buttonVariants({ variant: "ghost" })}
      >
        {!next && <ChevronLeft />}
        <span className="hidden sm:inline">{label}</span>
        {next && <ChevronRight />}
      </Link>
    );

  return (
    <Pagination className="pt-6">
      <PaginationContent>
        <PaginationItem>{edge(page - 1, page <= 1, "Previous", false)}</PaginationItem>
        {getPageRange(page, totalPages).map((p, i) => (
          <PaginationItem key={`${p}-${i}`} className="hidden sm:block">
            {p === "…" ? (
              <PaginationEllipsis />
            ) : (
              <Link
                to={hrefFor(p)}
                aria-current={p === page ? "page" : undefined}
                className={buttonVariants({
                  variant: p === page ? "outline" : "ghost",
                  size: "icon",
                })}
              >
                {p}
              </Link>
            )}
          </PaginationItem>
        ))}
        <PaginationItem className="px-2 text-sm text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </PaginationItem>
        <PaginationItem>
          {edge(page + 1, page >= totalPages, "Next", true)}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
