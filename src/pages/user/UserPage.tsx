import { ErrorState } from "@/components/shared/ErrorState";
import { NotFoundState } from "@/components/shared/NotFoundState";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Pager } from "@/features/repos/components/Pager";
import { RepoGrid, RepoGridSkeleton } from "@/features/repos/components/RepoGrid";
import { useRepos, useStarred, useUser } from "@/features/repos/queries";
import type { GitHubUser, RepoPage } from "@/features/repos/types";
import { ProfileCard, ProfileCardSkeleton } from "@/features/users/components/ProfileCard";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatCompact } from "@/libs/utils";
import { PER_PAGE } from "@/services/github";
import { cn } from "cn";
import { BookMarked, FolderOpen, Star } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  createEnumParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import { RepoToolbar, type SortOption } from "./RepoToolbar";

const REPO_SORTS: SortOption<SortKey>[] = [
  { label: "Last pushed", value: "updated" },
  { label: "Stars", value: "stars" },
  { label: "Forks", value: "forks" },
  { label: "Name", value: "name" },
];
const STARRED_SORTS: SortOption<StarredSortKey>[] = [
  { label: "Recently starred", value: "created" },
  { label: "Recently updated", value: "updated" },
];

const paramConfig = {
  tab: withDefault(createEnumParam(["repos", "starred"] as const), "repos" as const),
  sort: StringParam,
  direction: withDefault(createEnumParam<SortDirection>(["desc", "asc"]), "desc"),
  page: withDefault(NumberParam, 1),
  q: StringParam,
};

const isOneOf = <T extends string>(options: SortOption<T>[], v?: string | null): v is T =>
  options.some((o) => o.value === v);

export default function UserPage() {
  const { username = "" } = useParams();
  // Remount per user so local UI state (the filter draft) doesn't leak across profiles.
  return <UserProfile key={username.toLowerCase()} username={username} />;
}

function UserProfile({ username }: { username: string }) {
  const { viewer, isLoading: authLoading } = useAuth();
  const isViewer = viewer?.login.toLowerCase() === username.toLowerCase();
  const { data: user, isLoading, error, refetch } = useUser(username);

  useDocumentTitle(user ? `${user.name ?? user.login} (@${user.login})` : username);

  if (error?.status === 404) {
    return (
      <Page>
        <NotFoundState
          title="User not found"
          description={`There's no GitHub account named “${username}”. Check the spelling or try someone else.`}
        />
      </Page>
    );
  }

  return (
    <Page className="grid gap-10 lg:grid-cols-[16rem_1fr]">
      {error ? (
        <div className="lg:col-span-2">
          <ErrorState message={error.message} onRetry={() => refetch()} />
        </div>
      ) : (
        <>
          {user ? (
            <ProfileCard user={isViewer && viewer ? viewer : user} isViewer={isViewer} />
          ) : (
            <ProfileCardSkeleton />
          )}
          <RepoSection
            username={username}
            user={isViewer && viewer ? viewer : user}
            isViewer={isViewer}
            // wait for auth so we pick /user/repos vs /users/:name/repos only once
            userLoading={isLoading || authLoading}
          />
        </>
      )}
    </Page>
  );
}

function RepoSection({
  username,
  user,
  isViewer,
  userLoading,
}: {
  username: string;
  user?: GitHubUser;
  isViewer: boolean;
  userLoading: boolean;
}) {
  const [params, setParams] = useQueryParams(paramConfig);
  const { tab } = params;
  const direction = params.direction ?? "desc";
  const page = Math.max(1, Math.floor(params.page));
  const repoSort = isOneOf(REPO_SORTS, params.sort) ? params.sort : "updated";
  const starredSort = isOneOf(STARRED_SORTS, params.sort) ? params.sort : "created";

  const repos = useRepos(
    { username, page, sort: repoSort, direction, query: params.q, isViewer },
    tab === "repos" && !userLoading,
  );
  const starred = useStarred(
    { username, page, sort: starredSort, direction, isViewer },
    tab === "starred" && !userLoading,
  );
  const active = tab === "repos" ? repos : starred;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, tab]);

  const repoCount = user
    ? user.public_repos + (isViewer ? (user.total_private_repos ?? 0) : 0)
    : undefined;

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="Repositories">
      <nav className="flex gap-1 border-b" aria-label="Profile sections">
        <TabLink to="?" active={tab === "repos"} icon={<BookMarked />}>
          Repositories
          {repoCount !== undefined && <Count>{formatCompact(repoCount)}</Count>}
        </TabLink>
        <TabLink to="?tab=starred" active={tab === "starred"} icon={<Star />}>
          Starred
        </TabLink>
      </nav>

      {tab === "repos" ? (
        <RepoToolbar
          key="repos"
          sort={repoSort}
          sortOptions={REPO_SORTS}
          direction={direction}
          onSortChange={(sort) => setParams({ sort, page: undefined }, "replaceIn")}
          onDirectionChange={(d) => setParams({ direction: d, page: undefined }, "replaceIn")}
          filter={params.q ?? ""}
          onFilterChange={(q) => setParams({ q: q || undefined, page: undefined }, "replaceIn")}
        />
      ) : (
        <RepoToolbar
          key="starred"
          sort={starredSort}
          sortOptions={STARRED_SORTS}
          direction={direction}
          onSortChange={(sort) => setParams({ sort, page: undefined }, "replaceIn")}
          onDirectionChange={(d) => setParams({ direction: d, page: undefined }, "replaceIn")}
        />
      )}

      {tab === "repos" && params.q && repoSort === "name" && (
        <p className="text-xs text-muted-foreground">
          Showing best matches — name sorting isn't available while filtering.
        </p>
      )}

      <RepoResults
        data={active.data}
        isLoading={userLoading || active.isLoading}
        isFetching={active.isFetching}
        error={active.error}
        onRetry={() => active.refetch()}
        emptyState={
          <EmptyResults
            tab={tab}
            login={user?.login ?? username}
            query={params.q}
            page={page}
            onClearQuery={() => setParams({ q: undefined, page: undefined }, "replaceIn")}
          />
        }
        showOwner={tab === "starred"}
        page={page}
      />
    </section>
  );
}

function RepoResults({
  data,
  isLoading,
  isFetching,
  error,
  onRetry,
  emptyState,
  showOwner,
  page,
}: {
  data?: RepoPage;
  isLoading: boolean;
  isFetching: boolean;
  error: { message: string } | null;
  onRetry: () => void;
  emptyState: ReactNode;
  showOwner: boolean;
  page: number;
}) {
  if (isLoading) return <RepoGridSkeleton count={PER_PAGE / 2} />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!data?.items.length) return emptyState;

  return (
    <>
      {data.totalCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          {data.totalCount.toLocaleString("en-US")}{" "}
          {data.totalCount === 1 ? "repository" : "repositories"}
        </p>
      )}
      <RepoGrid repos={data.items} isFetching={isFetching} showOwner={showOwner} />
      <Pager page={page} totalPages={data.totalPages} />
    </>
  );
}

function EmptyResults({
  tab,
  login,
  query,
  page,
  onClearQuery,
}: {
  tab: "repos" | "starred";
  login: string;
  query?: string | null;
  page: number;
  onClearQuery: () => void;
}) {
  let title = tab === "repos" ? "No repositories yet" : "No starred repositories";
  let description =
    tab === "repos"
      ? `${login} doesn't have any public repositories yet.`
      : `${login} hasn't starred any repositories yet.`;
  let action: ReactNode = null;

  if (tab === "repos" && query) {
    title = "No matching repositories";
    description = `No repository names match “${query}”.`;
    action = (
      <Button variant="outline" onClick={onClearQuery}>
        Clear filter
      </Button>
    );
  } else if (page > 1) {
    title = "This page is empty";
    description = "You've gone past the last page.";
    action = (
      <Link to={tab === "starred" ? "?tab=starred" : "?"} className="text-sm text-brand hover:underline">
        Back to the first page
      </Link>
    );
  }

  return (
    <Empty className="border border-dashed py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action}
    </Empty>
  );
}

function TabLink({
  to,
  active,
  icon,
  children,
}: {
  to: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors [&>svg]:size-4",
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

const Count = ({ children }: { children: ReactNode }) => (
  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
    {children}
  </span>
);
