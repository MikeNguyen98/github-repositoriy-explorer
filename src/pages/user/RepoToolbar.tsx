import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SortOption<T extends string> {
  label: string;
  value: T;
}

interface RepoToolbarProps<T extends string> {
  sort: T;
  sortOptions: SortOption<T>[];
  direction: SortDirection;
  onSortChange: (sort: T) => void;
  onDirectionChange: (direction: SortDirection) => void;
  /** Omit to hide the name filter (e.g. starred repos can't be searched). */
  filter?: string;
  onFilterChange?: (filter: string) => void;
}

export function RepoToolbar<T extends string>({
  sort,
  sortOptions,
  direction,
  onSortChange,
  onDirectionChange,
  filter,
  onFilterChange,
}: RepoToolbarProps<T>) {
  const [draft, setDraft] = useState(filter ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const changeFilter = (value: string) => {
    setDraft(value);
    clearTimeout(timer.current);
    // Debounced: each keystroke would otherwise cost a Search API request.
    timer.current = setTimeout(() => onFilterChange?.(value.trim()), 400);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {onFilterChange && (
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Find a repository"
            placeholder="Find a repository…"
            value={draft}
            onChange={(e) => changeFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      <div className="flex items-center gap-2 sm:ml-auto">
        <Select
          items={sortOptions}
          value={sort}
          onValueChange={(v) => v && onSortChange(v as T)}
        >
          <SelectTrigger aria-label="Sort by" className="min-w-44 flex-1 sm:flex-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          aria-label={direction === "desc" ? "Sorted descending" : "Sorted ascending"}
          title={direction === "desc" ? "Descending" : "Ascending"}
          onClick={() => onDirectionChange(direction === "desc" ? "asc" : "desc")}
        >
          {direction === "desc" ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
        </Button>
      </div>
    </div>
  );
}
