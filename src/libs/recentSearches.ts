const STORAGE_KEY = "recent-searches";
const MAX = 6;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

let current = read();

function write(next: string[]) {
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — keep the in-memory list only
  }
  listeners.forEach((l) => l());
}

export const recentSearches = {
  get: () => current,
  add(username: string) {
    const rest = current.filter((u) => u.toLowerCase() !== username.toLowerCase());
    write([username, ...rest].slice(0, MAX));
  },
  remove: (username: string) => write(current.filter((u) => u !== username)),
  clear: () => write([]),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
