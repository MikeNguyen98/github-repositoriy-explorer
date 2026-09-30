import { ErrorState } from "@/components/shared/ErrorState";
import { NotFoundState } from "@/components/shared/NotFoundState";
import { Page } from "@/components/shared/Page";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageBar } from "@/features/repos/components/LanguageBar";
import { Readme } from "@/features/repos/components/Readme";
import { useRepo, useRepoLanguages, useRepoReadme } from "@/features/repos/queries";
import type { GitHubRepo } from "@/features/repos/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatBytes, formatMonthYear, formatNumber, timeAgo } from "@/libs/utils";
import {
  Archive,
  BookOpen,
  CircleDot,
  Eye,
  GitBranch,
  GitFork,
  HardDrive,
  History,
  Link2,
  Lock,
  Scale,
  Star,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";

export default function RepoPage() {
  const { username = "", repo: name = "" } = useParams();
  const { data: repo, isLoading, error, refetch } = useRepo(username, name);
  useDocumentTitle(repo?.full_name ?? `${username}/${name}`);

  if (error?.status === 404) {
    return (
      <Page>
        <NotFoundState
          title="Repository not found"
          description={`“${username}/${name}” doesn't exist or is private.`}
        />
      </Page>
    );
  }

  return (
    <Page className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to={`/users/${username}`} />}>
              {username}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading || !repo ? (
        <RepoSkeleton />
      ) : (
        <RepoDetails repo={repo} />
      )}
    </Page>
  );
}

function RepoDetails({ repo }: { repo: GitHubRepo }) {
  const owner = repo.owner.login;
  const languages = useRepoLanguages(owner, repo.name);
  const readme = useRepoReadme(owner, repo.name);

  return (
    <>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <img src={repo.owner.avatar_url} alt="" className="size-10 rounded-full border" />
          <h1 className="text-2xl font-bold tracking-tight break-all sm:text-3xl">
            <Link to={`/users/${owner}`} className="font-normal text-muted-foreground hover:text-brand">
              {owner}
            </Link>
            <span className="px-1 font-normal text-muted-foreground">/</span>
            {repo.name}
          </h1>
          {repo.private && (
            <Badge variant="outline">
              <Lock data-icon="inline-start" /> Private
            </Badge>
          )}
          {repo.fork && <Badge variant="secondary">Fork</Badge>}
          {repo.archived && (
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
              <Archive data-icon="inline-start" /> Archived
            </Badge>
          )}
        </div>
        {repo.description && (
          <p className="max-w-3xl text-lg text-muted-foreground">{repo.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ className: "bg-brand text-brand-foreground hover:bg-brand/90" })}
          >
            View on GitHub
            <ExternalLink data-icon="inline-end" />
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <Link2 data-icon="inline-start" />
              Website
            </a>
          )}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Star />} label="Stars" value={repo.stargazers_count} />
        <Stat icon={<GitFork />} label="Forks" value={repo.forks_count} />
        <Stat icon={<Eye />} label="Watchers" value={repo.subscribers_count ?? repo.watchers_count} />
        <Stat icon={<CircleDot />} label="Open issues" value={repo.open_issues_count} />
      </dl>

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <section className="min-w-0 rounded-xl border bg-card" aria-labelledby="readme-heading">
          <h2
            id="readme-heading"
            className="flex items-center gap-2 border-b px-5 py-3 text-sm font-semibold"
          >
            <BookOpen className="size-4" /> README
          </h2>
          <div className="p-5 sm:p-8">
            {readme.isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : readme.error ? (
              <ErrorState message={readme.error.message} onRetry={() => readme.refetch()} />
            ) : readme.data ? (
              <Readme html={readme.data} />
            ) : (
              <p className="text-sm text-muted-foreground italic">This repository has no README.</p>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <SidebarBlock title="About">
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              {repo.license && (
                <Meta icon={<Scale />}>{repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : repo.license.name}</Meta>
              )}
              <Meta icon={<GitBranch />}>{repo.default_branch}</Meta>
              <Meta icon={<HardDrive />}>{formatBytes(repo.size)}</Meta>
              <Meta icon={<CalendarDays />}>Created {formatMonthYear(repo.created_at)}</Meta>
              <Meta icon={<History />}>Last push {timeAgo(repo.pushed_at)}</Meta>
            </ul>
          </SidebarBlock>

          {!!repo.topics?.length && (
            <SidebarBlock title="Topics">
              <ul className="flex flex-wrap gap-1.5">
                {repo.topics.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </SidebarBlock>
          )}

          <SidebarBlock title="Languages">
            {languages.isLoading ? (
              <Skeleton className="h-2 w-full" />
            ) : languages.data ? (
              <LanguageBar languages={languages.data} />
            ) : (
              <p className="text-sm text-muted-foreground">Couldn't load languages.</p>
            )}
          </SidebarBlock>
        </aside>
      </div>
    </>
  );
}

const Stat = ({ icon, label, value }: { icon: ReactNode; label: string; value: number }) => (
  <div className="rounded-xl border bg-card p-4">
    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&>svg]:size-3.5">
      {icon}
      {label}
    </dt>
    <dd className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(value)}</dd>
  </div>
);

const SidebarBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold">{title}</h2>
    {children}
  </section>
);

const Meta = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <li className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">
    {icon}
    <span className="truncate">{children}</span>
  </li>
);

function RepoSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
