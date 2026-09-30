import { describe, expect, it } from "vitest";
import { formatBytes, formatCompact, getPageRange, timeAgo } from ".";

describe("getPageRange", () => {
  it("lists every page when there are few", () => {
    expect(getPageRange(1, 3)).toEqual([1, 2, 3]);
  });

  it("collapses distant pages into ellipses", () => {
    expect(getPageRange(6, 20)).toEqual([1, "…", 5, 6, 7, "…", 20]);
  });

  it("handles the edges", () => {
    expect(getPageRange(1, 20)).toEqual([1, 2, "…", 20]);
    expect(getPageRange(20, 20)).toEqual([1, "…", 19, 20]);
    expect(getPageRange(1, 1)).toEqual([1]);
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-06-15T12:00:00Z").getTime();

  it.each([
    ["2026-06-15T08:00:00Z", "today"],
    ["2026-06-14T08:00:00Z", "yesterday"],
    ["2026-06-05T12:00:00Z", "10 days ago"],
    ["2026-05-10T12:00:00Z", "last month"],
    ["2026-01-01T12:00:00Z", "5 months ago"],
    ["2023-06-01T12:00:00Z", "3 years ago"],
  ])("%s → %s", (date, expected) => {
    expect(timeAgo(date, now)).toBe(expected);
  });
});

describe("formatters", () => {
  it("formats compact numbers in English regardless of locale", () => {
    expect(formatCompact(512_632)).toBe("512.6K");
    expect(formatCompact(999)).toBe("999");
  });

  it("formats repository sizes", () => {
    expect(formatBytes(512)).toBe("512 KB");
    expect(formatBytes(2048)).toBe("2.0 MB");
  });
});
