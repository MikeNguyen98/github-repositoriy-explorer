import { useRepos, useStarred, useUser } from "@/features/repos/queries";
import type { GitHubRepo } from "@/features/repos/types";
import { useAuth } from "@/hooks/useAuth";
import { ReactRouter7Adapter } from "@/libs/ReactRouter7Adapter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryParamProvider } from "use-query-params";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserPage from "./UserPage";

vi.mock("@/features/repos/queries", () => ({
  useUser: vi.fn(),
  useRepos: vi.fn(),
  useStarred: vi.fn(),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: vi.fn() }));
// Base UI's Select needs layout APIs jsdom doesn't have; sorting is covered by service tests.
vi.mock("@/components/ui/select", () => ({
  Select: () => null,
  SelectContent: () => null,
  SelectGroup: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

const repo = (id: number, name: string, owner = "octocat") =>
  ({
    id,
    name,
    full_name: `${owner}/${name}`,
    description: null,
    stargazers_count: 1200,
    forks_count: 3,
    language: "TypeScript",
    topics: [],
    fork: false,
    archived: false,
    private: false,
    pushed_at: new Date().toISOString(),
    owner: { login: owner, avatar_url: "", html_url: "" },
  }) as unknown as GitHubRepo;

const user = {
  login: "octocat",
  name: "The Octocat",
  type: "User",
  avatar_url: "",
  bio: "Mascot",
  public_repos: 8,
  followers: 10,
  following: 1,
  html_url: "https://github.com/octocat",
  created_at: "2011-01-25T18:44:36Z",
};

const query = (data: unknown, extra: object = {}) =>
  ({ data, isLoading: false, isFetching: false, error: null, refetch: vi.fn(), ...extra }) as never;

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <QueryParamProvider adapter={ReactRouter7Adapter}>
        <Routes>
          <Route path="/users/:username" element={<UserPage />} />
        </Routes>
      </QueryParamProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isSignedIn: false, viewer: undefined, isLoading: false });
  vi.mocked(useUser).mockReturnValue(query(user));
  vi.mocked(useRepos).mockReturnValue(
    query({ items: [repo(1, "hello-world"), repo(2, "spoon-knife")], totalPages: 3 }),
  );
  vi.mocked(useStarred).mockReturnValue(
    query({ items: [repo(3, "react", "facebook")], totalPages: 1 }),
  );
});

describe("UserPage", () => {
  it("shows the profile and repositories", () => {
    renderAt("/users/octocat");

    expect(screen.getByRole("heading", { level: 1, name: "The Octocat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hello-world/ })).toHaveAttribute(
      "href",
      "/users/octocat/hello-world",
    );
    expect(screen.getByText("spoon-knife")).toBeInTheDocument();
  });

  it("requests repositories with the params from the URL", () => {
    renderAt("/users/octocat?sort=stars&direction=asc&page=2&q=cli");

    expect(useRepos).toHaveBeenLastCalledWith(
      {
        username: "octocat",
        page: 2,
        sort: "stars",
        direction: "asc",
        query: "cli",
        isViewer: false,
      },
      true,
    );
  });

  it("falls back to defaults for invalid params", () => {
    renderAt("/users/octocat?sort=bogus&page=-4");

    expect(useRepos).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "updated", direction: "desc", page: 1 }),
      true,
    );
  });

  it("renders numbered pagination links", () => {
    renderAt("/users/octocat?sort=stars");

    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "href",
      "/users/octocat?sort=stars&page=2",
    );
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("aria-current", "page");
  });

  it("switches to the starred tab", async () => {
    renderAt("/users/octocat");

    await userEvent.click(screen.getByRole("link", { name: /starred/i }));

    expect(await screen.findByText("facebook/")).toBeInTheDocument();
    expect(useStarred).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: "octocat", sort: "created" }),
      true,
    );
  });

  it("uses the private-aware endpoint when viewing your own profile", () => {
    vi.mocked(useAuth).mockReturnValue({
      isSignedIn: true,
      viewer: { ...user, total_private_repos: 4 } as never,
      isLoading: false,
    });

    renderAt("/users/OctoCat");

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument(); // 8 public + 4 private
    expect(useRepos).toHaveBeenLastCalledWith(
      expect.objectContaining({ isViewer: true }),
      true,
    );
  });

  it("shows a not-found state for unknown users", () => {
    vi.mocked(useUser).mockReturnValue(
      query(undefined, { error: Object.assign(new Error("Not found."), { status: 404 }) }),
    );

    renderAt("/users/ghost");

    expect(screen.getByText("User not found")).toBeInTheDocument();
  });

  it("shows an error with retry for other failures", async () => {
    const refetch = vi.fn();
    vi.mocked(useUser).mockReturnValue(
      query(undefined, {
        error: Object.assign(new Error("GitHub API rate limit exceeded."), { status: 403 }),
        refetch,
      }),
    );

    renderAt("/users/octocat");

    expect(screen.getByText("GitHub API rate limit exceeded.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("offers to clear the filter when nothing matches", async () => {
    vi.mocked(useRepos).mockReturnValue(query({ items: [], totalPages: 1, totalCount: 0 }));

    renderAt("/users/octocat?q=zzz");

    expect(screen.getByText("No matching repositories")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /clear filter/i }));
    expect(useRepos).toHaveBeenLastCalledWith(expect.objectContaining({ query: undefined }), true);
  });
});
