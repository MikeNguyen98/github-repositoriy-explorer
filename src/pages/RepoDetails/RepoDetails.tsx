import { useRepo } from "@/features/repos/useRepos";
import { CalendarDays, CircleDot, GitFork, Link2, Star } from "lucide-react";
import { Link, useParams } from "react-router";
import NotFound from "../NotFound";

const RepoDetails = () => {
  const params = useParams();
  console.log(params);
  const { username = "", repo = "" } = params;
  const { data } = useRepo({ username, reponame: repo });

  if (!data) return <NotFound />;

  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-6 flex-row items-start">
        <img
          src={data.owner.avatar_url}
          alt={data.name}
          className="size-24 rounded-2xl border border-border"
        />
        <div className="min-w-0">
          <div className="flex flex-col items-baseline">
            <div className="text-xl font-bold">{data.name}</div>
            <Link
              to={data.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @{data.name}
            </Link>
          </div>
          <p className="mt-2 text-start text-muted-foreground">
            {data.description ?? "No description provided."}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {data.homepage && (
              <Link
                to={data.homepage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Link2 className="size-4" /> {data.homepage}
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" /> Joined{" "}
              {new Date(data.created_at).getFullYear()}
            </span>
          </div>
            
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5" />{" "}
              {data.stargazers_count.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitFork className="size-3.5" />{" "}
              {data.forks_count.toLocaleString()}
            </span>
            {data.open_issues_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <CircleDot className="size-3.5" /> {data.open_issues_count}
              </span>
            )}
          </div>
          {data.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoDetails;
