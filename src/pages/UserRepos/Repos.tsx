import type { GitHubRepo } from "@/features/repos/types";
import { timeAgo } from "@/libs/utils";
import { CircleDot, GitFork, Star } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  HTML: "#E34C26",
  CSS: "#563D7C",
};

const Repos = React.memo(({ data }: { data: GitHubRepo[] }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {data.map((repo) => (
        <Link
          key={repo.id}
          to={`/users/${repo.owner.login}/${repo.name}`}
          className="group flex flex-col rounded-xl border bg-card p-5 text-start transition-shadow hover:shadow-md"
        >
          <h3 className="font-semibold text-primary group-hover:underline">
            {repo.name}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {repo.description ?? "No description provided."}
          </p>
          {repo.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {repo.topics.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {repo.language && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: LANG_COLORS[repo.language] ?? "#8B949E" }}
                />
                {repo.language}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5" />{" "}
              {repo.stargazers_count.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitFork className="size-3.5" />{" "}
              {repo.forks_count.toLocaleString()}
            </span>
            {repo.open_issues_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <CircleDot className="size-3.5" /> {repo.open_issues_count}
              </span>
            )}
            <span className="ml-auto">updated {timeAgo(repo.pushed_at)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
});

export default Repos;
