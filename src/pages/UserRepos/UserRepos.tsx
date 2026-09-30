import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGitUser, useRepos } from "@/features/repos/useRepos";
import { PER_PAGE } from "@/services/github";
import { useParams } from "react-router";
import {
  createEnumParam,
  NumberParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import NotFound from "../NotFound";
import Profile from "./Profile";
import Repos from "./Repos";
import { ProfileSkeleton, ReposSkeleton } from "./UserReposSkeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { cn } from "cn";

const SORT_KEYS: SortKey[] = ["stars", "updated", "name", "forks"];
const DIRECTIONS: SortDirection[] = ["desc", "asc"];

const itemsSortKey: { label: string; value: SortKey }[] = [
  { label: "Stars", value: "stars" },
  { label: "Last pushed", value: "updated" },
  { label: "Forks", value: "forks" },
  { label: "Name", value: "name" },
];

const paramConfig = {
  sort: withDefault(createEnumParam<SortKey>(SORT_KEYS), "updated"),
  direction: withDefault(createEnumParam<SortDirection>(DIRECTIONS), "desc"),
  page: withDefault(NumberParam, 1),
};

function UserRepos() {
  const { username = "" } = useParams();
  const [params, setParams] = useQueryParams(paramConfig);
  const page = Math.max(1, params.page);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGitUser(username);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useRepos({
    username,
    page,
    sort: params.sort,
    direction: params.direction,
  });

  const repos = data?.items;
  const hasNext = data?.hasNext ?? false;

  if (isUserLoading) {
    return (
      <div className="flex flex-col gap-4">
        <ProfileSkeleton />
        <ReposSkeleton count={PER_PAGE} />
      </div>
    );
  }

  if (isUserError) {
    const { status } = userError;
    if (status === 404) return <NotFound />;
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircleIcon />
        <AlertTitle>Error: {status}</AlertTitle>
        <AlertDescription>{userError.message}</AlertDescription>
      </Alert>
    );
  }
  if (!user) return <NotFound />;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Profile user={user} />

        <div className="flex items-center gap-2">
          Sort by:
          <Select
            items={itemsSortKey}
            value={params.sort}
            onValueChange={(v) =>
              setParams({ sort: v as SortKey, page: undefined }, "replaceIn")
            }
          >
            <SelectTrigger className="min-w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {itemsSortKey.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            onClick={() =>
              setParams(
                {
                  direction: params.direction === "desc" ? "asc" : "desc",
                  page: undefined,
                },
                "replaceIn",
              )
            }
          >
            {params.direction === "desc" ? "↓ Desc" : "↑ Asc"}
          </Button>
        </div>
        {isLoading && <ReposSkeleton count={PER_PAGE} />}
        {isError && <div>Error: {error.message}</div>}
        {!isLoading && !isError && !repos?.length && (
          <div>No repositories found.</div>
        )}

        {!!repos?.length && (
          <div
            aria-busy={isFetching}
            className={cn("transition-opacity", isFetching && "opacity-60")}
          >
            <Repos data={repos} />
          </div>
        )}
      </div>

      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={page <= 1}
              className={cn(page <= 1 && "pointer-events-none opacity-50")}
              onClick={() => setParams({ page: page - 1 }, "pushIn")}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              aria-disabled={!hasNext}
              className={cn(!hasNext && "pointer-events-none opacity-50")}
              onClick={() => setParams({ page: page + 1 }, "pushIn")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}

export default UserRepos;
