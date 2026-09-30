/// <reference types="vite/client" />

type SortKey = "stars" | "updated" | "name" | "forks";
type StarredSortKey = "created" | "updated";
type SortDirection = "desc" | "asc";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  readonly VITE_GITHUB_OAUTH_SCOPE?: string;
}
