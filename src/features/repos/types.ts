export interface GitHubUser {
  login: string;
  name: string | null;
  type: "User" | "Organization";
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
  twitter_username: string | null;
  public_repos: number;
  /** Only present for the authenticated user (`GET /user`). */
  total_private_repos?: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  subscribers_count?: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  license: { name: string; spdx_id: string | null } | null;
  size: number;
  default_branch: string;
  owner: Pick<GitHubUser, "login" | "avatar_url" | "html_url">;
}

export interface RepoPage {
  items: GitHubRepo[];
  totalPages: number;
  /** Known only for search results. */
  totalCount?: number;
}
