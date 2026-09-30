import axios, { AxiosError, isCancel } from "axios";

export class ApiError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.github.com",
  timeout: 10_000,
  headers: {
    Accept: "application/vnd.github+json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    if (isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    let message = error.response?.data?.message ?? error.message;

    if (!error.response) message = "Cannot connect to GitHub API";
    else if (status === 404) message = "Not found";
    else if (
      (status === 403 || status === 429) &&
      error.response.headers["x-ratelimit-remaining"] === "0"
    ) {
      message = "GitHub API rate limit exceeded";
    }

    return Promise.reject(new ApiError(message, status));
  },
);
