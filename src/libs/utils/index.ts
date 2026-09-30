const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export const formatNumber = (n: number) => numberFormat.format(n);
export const formatCompact = (n: number) => compactFormat.format(n);
export const formatMonthYear = (date: string) =>
  dateFormat.format(new Date(date));

export function timeAgo(date: string, now = Date.now()) {
  const days = Math.floor((now - new Date(date).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (days < 365) return months === 1 ? "last month" : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "last year" : `${years} years ago`;
}

export function formatBytes(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${(kb / 1024 / 1024).toFixed(1)} GB`;
}

/**
 * Page numbers to render around the current page, with "…" gaps.
 * e.g. (6, 20) → [1, "…", 5, 6, 7, "…", 20]
 */
export function getPageRange(current: number, total: number, siblings = 1) {
  const pages: (number | "…")[] = [];
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);

  pages.push(1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  if (total > 1) pages.push(total);
  return pages;
}
