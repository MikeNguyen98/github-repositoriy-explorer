import SearchBar from "@/components/shared/SearchBar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserMenu } from "@/components/shared/UserMenu";
import { useLocation, useParams } from "react-router";
import { Logo } from "./Logo";

export function Header() {
  const { pathname } = useLocation();
  const { username = "" } = useParams();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo />
        <div className="flex-1">
          {pathname !== "/" && (
            // key resets the input when navigating to another user
            <SearchBar key={username} defaultValue={username} className="max-w-md" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
