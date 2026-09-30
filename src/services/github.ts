import type { GitHubRepo, GitHubUser, RepoPage } from "@/features/repos/types";
import { api } from "@/libs/api";

export const PER_PAGE = 12;
// The Search API never returns more than 1,000 results.
const SEARCH_MAX_PAGE = Math.floor(1000 / PER_PAGE);

// The repo list endpoints only sort by created | updated | pushed | full_name
// and silently ignore anything else, so stars/forks (and name filtering) go
// through the Search API instead.
const LIST_SORT: Partial<Record<SortKey, string>> = {
  updated: "pushed",
  name: "full_name",
};

/** Total pages from the `Link` header; GitHub omits rel="last" on the last page. */
export function totalPagesFromLink(link: unknown, page: number) {
  if (typeof link !== "string") return page;
  const last = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  if (last) return Number(last[1]);
  return link.includes('rel="next"') ? page + 1 : page;
}

interface RepoQuery {
  username: string;
  page?: number;
  sort?: SortKey | null;
  direction?: SortDirection | null;
  query?: string | null;
  /** Viewing your own profile: use /user/repos so private repos are included. */
  isViewer?: boolean;
}

export const githubService = {
  async getViewer(signal?: AbortSignal) {
    const { data } = await api.get<GitHubUser>("/user", { signal });
    return data;
  },

  async getUser(username: string, signal?: AbortSignal) {
    const { data } = await api.get<GitHubUser>(
      `/users/${encodeURIComponent(username)}`,
      { signal },
    );
    return data;
  },

  async getUserRepos(
    { username, page = 1, sort, direction, query, isViewer }: RepoQuery,
    signal?: AbortSignal,
  ): Promise<RepoPage> {
    sort ??= "updated";
    direction ??= "desc";
    const listSort = LIST_SORT[sort];
    const q = query?.trim();

    if (listSort && !q) {
      const url = isViewer
        ? "/user/repos"
        : `/users/${encodeURIComponent(username)}/repos`;
      const { data, headers } = await api.get<GitHubRepo[]>(url, {
        signal,
        params: {
          per_page: PER_PAGE,
          page,
          sort: listSort,
          direction,
          ...(isViewer && { affiliation: "owner" }),
        },
      });
      return { items: data, totalPages: totalPagesFromLink(headers.link, page) };
    }

    const { data, headers } = await api.get<{
      total_count: number;
      items: GitHubRepo[];
    }>("/search/repositories", {
      signal,
      params: {
        // fork:true keeps forked repos, matching the list endpoint
        q: `user:${username} fork:true${q ? ` ${q} in:name` : ""}`,
        // Search can't sort by name; best-match ordering is used instead.
        ...(sort !== "name" && {
          sort,
          order: direction,
        }),
        per_page: PER_PAGE,
        page,
      },
    });
    return {
      items: data.items,
      totalCount: data.total_count,
      totalPages: Math.min(
        totalPagesFromLink(headers.link, page),
        SEARCH_MAX_PAGE,
      ),
    };
  },

  async getStarred(
    {
      username,
      page = 1,
      sort,
      direction,
      isViewer,
    }: {
      username: string;
      page?: number;
      sort?: StarredSortKey | null;
      direction?: SortDirection | null;
      isViewer?: boolean;
    },
    signal?: AbortSignal,
  ): Promise<RepoPage> {
    const url = isViewer
      ? "/user/starred"
      : `/users/${encodeURIComponent(username)}/starred`;
    const { data, headers } = await api.get<GitHubRepo[]>(url, {
      signal,
      params: {
        per_page: PER_PAGE,
        page,
        sort: sort ?? "created",
        direction: direction ?? "desc",
      },
    });
    return { items: data, totalPages: totalPagesFromLink(headers.link, page) };
  },

  async getRepo(owner: string, repo: string, signal?: AbortSignal) {
    const { data } = await api.get<GitHubRepo>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { signal },
    );
    return data;
  },

  async getRepoLanguages(owner: string, repo: string, signal?: AbortSignal) {
    const { data } = await api.get<Record<string, number>>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
      { signal },
    );
    return data;
  },

  /** README rendered to HTML by GitHub, or null when the repo has none. */
  async getRepoReadme(owner: string, repo: string, signal?: AbortSignal) {
    try {
      const { data } = await api.get<string>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
        {
          signal,
          headers: { Accept: "application/vnd.github.html+json" },
          responseType: "text",
        },
      );
      return data;
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null;
      throw error;
    }
  },
};
