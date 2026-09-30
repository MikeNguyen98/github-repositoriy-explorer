import { Skeleton } from "@/components/ui/skeleton";
import type { GitHubRepo } from "@/features/repos/types";
import { cn } from "cn";
import { RepoCard } from "./RepoCard";

interface RepoGridProps {
  repos: GitHubRepo[];
  isFetching?: boolean;
  showOwner?: boolean;
}

export function RepoGrid({ repos, isFetching, showOwner }: RepoGridProps) {
  return (
    <div
      aria-busy={isFetching}
      className={cn(
        "grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2",
        isFetching && "opacity-60",
      )}
    >
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} showOwner={showOwner} />
      ))}
    </div>
  );
}

export function RepoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border p-5">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="mt-2 flex gap-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
