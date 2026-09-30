import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/libs/auth";
import { BookMarked, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { SignInButton } from "./SignInButton";

export function UserMenu() {
  const { isSignedIn, viewer, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isSignedIn) return <SignInButton />;

  if (isLoading || !viewer) return <Skeleton className="size-8 rounded-full" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Account menu"
          />
        }
      >
        <Avatar>
          <AvatarImage src={viewer.avatar_url} alt="" />
          <AvatarFallback>{viewer.login.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{viewer.name ?? viewer.login}</p>
          <p className="truncate text-xs text-muted-foreground">@{viewer.login}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/users/${viewer.login}`)}>
          <BookMarked />
          Your repositories
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/users/${viewer.login}?tab=starred`)}>
          <Star />
          Your stars
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
