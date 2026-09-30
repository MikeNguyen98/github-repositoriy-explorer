import { api } from "@/libs/api";
import { describe, expect, it, vi } from "vitest";
import { githubService, totalPagesFromLink } from "./github";

vi.mock("@/libs/api", () => ({ api: { get: vi.fn() } }));
const get = vi.mocked(api.get);

const link = (page: number, last?: number) =>
  [
    `<https://api.github.com/x?page=${page + 1}>; rel="next"`,
    last && `<https://api.github.com/x?per_page=12&page=${last}>; rel="last"`,
  ]
    .filter(Boolean)
    .join(", ");


describe("totalPagesFromLink", () => {
  it("reads the last page", () => {
    expect(totalPagesFromLink(link(1, 9), 1)).toBe(9);
  });

  it("assumes one more page when only rel=next is present", () => {
    expect(totalPagesFromLink(link(3), 3)).toBe(4);
  });

  it("treats a missing header as the last page", () => {
    expect(totalPagesFromLink(undefined, 5)).toBe(5);
  });
});

describe("getUserRepos", () => {
  it("uses the list endpoint for 'last pushed' and maps it to sort=pushed", async () => {
    get.mockResolvedValue({ data: [], headers: {} });

    await githubService.getUserRepos({ username: "octocat", sort: "updated" });

    expect(get).toHaveBeenLastCalledWith(
      "/users/octocat/repos",
      expect.objectContaining({
        params: expect.objectContaining({ sort: "pushed", direction: "desc" }),
      }),
    );
  });

  it("uses /user/repos for the signed-in user so private repos are included", async () => {
    get.mockResolvedValue({ data: [], headers: {} });

    await githubService.getUserRepos({ username: "me", sort: "name", isViewer: true });

    expect(get).toHaveBeenLastCalledWith(
      "/user/repos",
      expect.objectContaining({
        params: expect.objectContaining({ sort: "full_name", affiliation: "owner" }),
      }),
    );
  });

  it.each(["stars", "forks"] as const)("uses the Search API to sort by %s", async (sort) => {
    get.mockResolvedValue({ data: { total_count: 30, items: [] }, headers: { link: link(1, 3) } });

    const page = await githubService.getUserRepos({ username: "octocat", sort, direction: "asc" });

    expect(get).toHaveBeenLastCalledWith(
      "/search/repositories",
      expect.objectContaining({
        params: expect.objectContaining({
          q: "user:octocat fork:true",
          sort,
          order: "asc",
        }),
      }),
    );
    expect(page).toEqual({ items: [], totalCount: 30, totalPages: 3 });
  });

  it("filters by name through the Search API", async () => {
    get.mockResolvedValue({ data: { total_count: 0, items: [] }, headers: {} });

    await githubService.getUserRepos({ username: "octocat", sort: "name", query: " cli " });

    const [, config] = get.mock.lastCall!;
    expect(config?.params).toMatchObject({ q: "user:octocat fork:true cli in:name" });
    // Search can't sort by name
    expect(config?.params).not.toHaveProperty("sort");
  });
});

describe("getRepoReadme", () => {
  it("returns null when the repository has no README", async () => {
    get.mockImplementation(async () => {
      throw Object.assign(new Error("Not found."), { status: 404 });
    });
    expect(await githubService.getRepoReadme("o", "r")).toBeNull();
  });

  it("rethrows other errors", async () => {
    get.mockImplementation(async () => {
      throw Object.assign(new Error("boom"), { status: 500 });
    });
    const error = await githubService.getRepoReadme("o", "r").catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("boom");
  });
});
