import type { GitHubRepo, GitHubUser } from "@/features/repos/types";
import { api } from "../libs/api";

export interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

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
      page,
      sort,
      direction,
    }: {
      username: string;
      page?: number;
      sort?: SortKey | null;
      direction?: SortDirection | null;
    },
    signal?: AbortSignal,
  ) => {
    const { data } = await api.get<GitHubRepo[]>(`/users/${username}/repos`, {
      signal,
      params: {
        per_page: 10,
        sort: sort,
        page: page,
        direction: direction,
      },
    });
    return data;
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
