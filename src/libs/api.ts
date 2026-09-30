import axios, { AxiosError, isCancel, type AxiosResponse } from "axios";
import { authStore, signOut } from "./auth";

export class ApiError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface RateLimit {
  remaining: number;
  limit: number;
  reset: Date;
}

// Latest core-API quota, surfaced in the footer so users understand 403s.
let rateLimit: RateLimit | null = null;
const listeners = new Set<() => void>();

export const rateLimitStore = {
  get: () => rateLimit,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function trackRateLimit(res?: AxiosResponse) {
  const h = res?.headers;
  if (!h || h["x-ratelimit-resource"] !== "core") return;
  rateLimit = {
    remaining: Number(h["x-ratelimit-remaining"]),
    limit: Number(h["x-ratelimit-limit"]),
    reset: new Date(Number(h["x-ratelimit-reset"]) * 1000),
  };
  listeners.forEach((l) => l());
}

const GITHUB_API = "https://api.github.com";
// Anonymous calls go through our caching proxy (server token, 5,000/h shared);
// signed-in calls go straight to GitHub with the user's own token.
const ANONYMOUS_API = import.meta.env.VITE_API_URL || "/api/github";

export const api = axios.create({
  baseURL: ANONYMOUS_API,
  timeout: 10_000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

api.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.baseURL = GITHUB_API;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    trackRateLimit(res);
    return res;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (isCancel(error)) return Promise.reject(error);
    trackRateLimit(error.response);

    const status = error.response?.status;
    let message = error.response?.data?.message ?? error.message;

    // Token revoked or expired: drop it so the user can keep browsing anonymously.
    if (status === 401 && authStore.getToken()) signOut();

    if (!error.response) message = "Cannot connect to the GitHub API.";
    else if (status === 404) message = "Not found.";
    else if (
      (status === 403 || status === 429) &&
      error.response.headers["x-ratelimit-remaining"] === "0"
    ) {
      const reset = new Date(
        Number(error.response.headers["x-ratelimit-reset"]) * 1000,
      );
      message = `GitHub API rate limit exceeded. Try again after ${reset.toLocaleTimeString()}.`;
    }

    return Promise.reject(new ApiError(message, status));
  },
);
