import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recentSearches } from "@/libs/recentSearches";
import { cn } from "cn";
import { ArrowRight, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

interface SearchBarProps {
  defaultValue?: string;
  size?: "default" | "lg";
  autoFocus?: boolean;
  className?: string;
}

const SearchBar = ({
  defaultValue = "",
  size = "default",
  autoFocus,
  className,
}: SearchBarProps) => {
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultValue);
  const lg = size === "lg";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const username = value.trim();
    if (!username) return;
    recentSearches.add(username);
    navigate(`/users/${encodeURIComponent(username)}`);
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn("relative flex w-full items-center gap-2", className)}
    >
      <Search
        className={cn(
          "pointer-events-none absolute left-3 text-muted-foreground",
          lg ? "size-5" : "size-4",
        )}
        aria-hidden
      />
      <Input
        type="search"
        aria-label="GitHub username"
        placeholder="Enter a GitHub username…"
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(lg ? "h-12 rounded-xl pl-11 text-base md:text-base" : "pl-9")}
      />
      <Button
        type="submit"
        aria-label="Search"
        className={cn(
          "bg-brand text-brand-foreground hover:bg-brand/90",
          lg && "h-12 rounded-xl px-5",
        )}
      >
        <span className={cn(!lg && "sr-only sm:not-sr-only")}>Search</span>
        {lg && <ArrowRight data-icon="inline-end" />}
        {!lg && <Search className="sm:hidden" />}
      </Button>
    </form>
  );
};

export default SearchBar;
