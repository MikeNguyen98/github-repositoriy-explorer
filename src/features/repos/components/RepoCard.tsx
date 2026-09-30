import { Badge } from "@/components/ui/badge";
import type { GitHubRepo } from "@/features/repos/types";
import { formatCompact, formatNumber, timeAgo } from "@/libs/utils";
import { Archive, GitFork, Lock, Star } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { LanguageDot } from "./LanguageDot";

interface RepoCardProps {
  repo: GitHubRepo;
  /** Show "owner/name" — used for starred repos owned by someone else. */
  showOwner?: boolean;
}

export const RepoCard = memo(function RepoCard({ repo, showOwner }: RepoCardProps) {
  return (
    <Link
      to={`/users/${repo.owner.login}/${repo.name}`}
      className="group flex flex-col rounded-xl border bg-card p-5 transition-all outline-none hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate font-semibold text-brand group-hover:underline">
          {showOwner && (
            <span className="font-normal text-muted-foreground">{repo.owner.login}/</span>
          )}
          {repo.name}
        </h3>
        <div className="flex shrink-0 gap-1">
          {repo.private && (
            <Badge variant="outline">
              <Lock data-icon="inline-start" />
              Private
            </Badge>
          )}
          {repo.fork && <Badge variant="secondary">Fork</Badge>}
          {repo.archived && (
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
              <Archive data-icon="inline-start" />
              Archived
            </Badge>
          )}
        </div>
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {repo.description ?? <span className="italic">No description provided.</span>}
      </p>

      {!!repo.topics?.length && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Topics">
          {repo.topics.slice(0, 3).map((t) => (
            <li
              key={t}
              className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand"
            >
              {t}
            </li>
          ))}
          {repo.topics.length > 3 && (
            <li className="px-1 py-0.5 text-xs text-muted-foreground">
              +{repo.topics.length - 3}
            </li>
          )}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <LanguageDot language={repo.language} />
            {repo.language}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1"
          title={`${formatNumber(repo.stargazers_count)} stars`}
        >
          <Star className="size-3.5" aria-label="Stars" />
          {formatCompact(repo.stargazers_count)}
        </span>
        <span
          className="inline-flex items-center gap-1"
          title={`${formatNumber(repo.forks_count)} forks`}
        >
          <GitFork className="size-3.5" aria-label="Forks" />
          {formatCompact(repo.forks_count)}
        </span>
        <span className="ml-auto">Updated {timeAgo(repo.pushed_at)}</span>
      </div>
    </Link>
  );
});
