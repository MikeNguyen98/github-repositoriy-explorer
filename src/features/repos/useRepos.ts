import { githubService } from "@/services/github";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useRepos = (props: {
  username: string;
  page?: number;
  sort?: SortKey | null;
  direction?: SortDirection | null;
}) =>
  useQuery({
    queryKey: ["repos", props],
    queryFn: ({ signal }) => githubService.getUserRepos(props, signal),
    enabled: !!props,
    placeholderData: keepPreviousData,
  });

export const useGitUser = (username: string) =>
  useQuery({
    queryKey: ["user", username],
    queryFn: ({ signal }) => githubService.getUser(username, signal),
    enabled: !!username,
    placeholderData: keepPreviousData,
  });

export const useRepo = (props: { username: string; reponame: string }) =>
  useQuery({
    queryKey: ["user", "repo", props],
    queryFn: ({ signal }) => githubService.getRepoOfUser(props, signal),
    enabled: !!props.username && !!props.reponame,
    placeholderData: keepPreviousData,
  });
