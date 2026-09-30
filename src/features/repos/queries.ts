import { githubService } from "@/services/github";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type RepoParams = Parameters<typeof githubService.getUserRepos>[0];
type StarredParams = Parameters<typeof githubService.getStarred>[0];

export const useUser = (username: string) =>
  useQuery({
    queryKey: ["user", username.toLowerCase()],
    queryFn: ({ signal }) => githubService.getUser(username, signal),
    enabled: !!username,
  });

export const useViewer = (enabled: boolean) =>
  useQuery({
    queryKey: ["viewer"],
    queryFn: ({ signal }) => githubService.getViewer(signal),
    enabled,
    staleTime: Infinity,
  });

export const useRepos = (params: RepoParams, enabled = true) =>
  useQuery({
    queryKey: ["repos", params],
    queryFn: ({ signal }) => githubService.getUserRepos(params, signal),
    enabled: enabled && !!params.username,
    placeholderData: keepPreviousData,
  });

export const useStarred = (params: StarredParams, enabled = true) =>
  useQuery({
    queryKey: ["starred", params],
    queryFn: ({ signal }) => githubService.getStarred(params, signal),
    enabled: enabled && !!params.username,
    placeholderData: keepPreviousData,
  });

export const useRepo = (owner: string, repo: string) =>
  useQuery({
    queryKey: ["repo", owner, repo],
    queryFn: ({ signal }) => githubService.getRepo(owner, repo, signal),
    enabled: !!owner && !!repo,
  });

export const useRepoLanguages = (owner: string, repo: string) =>
  useQuery({
    queryKey: ["repo", owner, repo, "languages"],
    queryFn: ({ signal }) => githubService.getRepoLanguages(owner, repo, signal),
    enabled: !!owner && !!repo,
  });

export const useRepoReadme = (owner: string, repo: string) =>
  useQuery({
    queryKey: ["repo", owner, repo, "readme"],
    queryFn: ({ signal }) => githubService.getRepoReadme(owner, repo, signal),
    enabled: !!owner && !!repo,
  });
