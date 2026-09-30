import type { GitHubRepo, GitHubUser } from "@/features/repos/types";
import { api } from "../libs/api";

export const PER_PAGE = 10;

// `/users/{username}/repos` only sorts by created | updated | pushed | full_name
// and silently ignores anything else, so stars/forks go through the Search API.
const LIST_SORT: Partial<Record<SortKey, string>> = {
  updated: "pushed",
  name: "full_name",
};

export interface ReposPage {
  items: GitHubRepo[];
  hasNext: boolean;
}

const hasNextPage = (link: unknown) =>
  typeof link === "string" && link.includes('rel="next"');

export const githubService = {
  getUser: async (username: string, signal?: AbortSignal) => {
    const { data } = await api.get<GitHubUser>(`/users/${username}`, {
      signal,
    });

    return data;
  },
  getUserRepos: async (
    {
      username,
      page = 1,
      sort,
      direction,
    }: {
      username: string;
      page?: number;
      sort?: SortKey | null;
      direction?: SortDirection | null;
    },
    signal?: AbortSignal,
  ): Promise<ReposPage> => {
    sort ??= "updated";
    direction ??= "desc";
    const listSort = LIST_SORT[sort];

    if (listSort) {
      const { data, headers } = await api.get<GitHubRepo[]>(
        `/users/${username}/repos`,
        {
          signal,
          params: { per_page: PER_PAGE, page, sort: listSort, direction },
        },
      );
      return { items: data, hasNext: hasNextPage(headers.link) };
    }

    const { data, headers } = await api.get<{ items: GitHubRepo[] }>(
      "/search/repositories",
      {
        signal,
        params: {
          // fork:true keeps forked repos, matching the list endpoint
          q: `user:${username} fork:true`,
          sort,
          order: direction,
          per_page: PER_PAGE,
          page,
        },
      },
    );
    return { items: data.items, hasNext: hasNextPage(headers.link) };
  },
  getRepoOfUser: async (
    {
      username,
      reponame,
    }: {
      username: string;
      reponame: string;
    },
    signal?: AbortSignal,
  ) => {
    const { data } = await api.get<GitHubRepo>(
      `/repos/${username}/${reponame}`,
      {
        signal,
      },
    );
    return data;
  },
};
