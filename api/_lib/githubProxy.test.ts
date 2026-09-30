// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleGitHubProxy } from "./githubProxy.js";

const fetchMock = vi.fn();
const get = (path: string, init?: RequestInit) =>
  new Request(`http://localhost/api/github?path=${path}`, init);

beforeEach(() => {
  fetchMock.mockResolvedValue(
    new Response("[]", {
      status: 200,
      headers: {
        "content-type": "application/json",
        link: '<https://api.github.com/x?page=2>; rel="next"',
        "x-ratelimit-remaining": "4999",
        "set-cookie": "should-not-leak=1",
      },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("handleGitHubProxy", () => {
  it("forwards allowed paths with the server token and query string", async () => {
    const res = await handleGitHubProxy(
      get("users/octocat/repos&page=2&sort=pushed"),
      { GITHUB_TOKEN: "ghp_server" },
    );

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.github.com/users/octocat/repos?page=2&sort=pushed");
    expect(init.headers.Authorization).toBe("Bearer ghp_server");
  });

  it("works without a token (anonymous upstream)", async () => {
    await handleGitHubProxy(get("users/octocat"), {});
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("passes pagination and rate-limit headers through, but nothing else", async () => {
    const res = await handleGitHubProxy(get("users/octocat/repos"), {});

    expect(res.headers.get("link")).toContain('rel="next"');
    expect(res.headers.get("x-ratelimit-remaining")).toBe("4999");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("lets the CDN cache successful responses only", async () => {
    const ok = await handleGitHubProxy(get("users/octocat"), {});
    expect(ok.headers.get("cache-control")).toContain("s-maxage=300");

    fetchMock.mockResolvedValue(new Response("{}", { status: 404 }));
    const missing = await handleGitHubProxy(get("users/ghost"), {});
    expect(missing.status).toBe(404);
    expect(missing.headers.get("cache-control")).toBe("no-store");
  });

  it("forwards the README HTML media type", async () => {
    await handleGitHubProxy(
      get("repos/facebook/react/readme", {
        headers: { Accept: "application/vnd.github.html+json" },
      }),
      {},
    );
    expect(fetchMock.mock.calls[0][1].headers.Accept).toBe("application/vnd.github.html+json");
  });

  it.each([
    "user", // the authenticated user's own data — never through a shared token
    "user/repos",
    "users/octocat/followers",
    "repos/o/r/issues",
    "orgs/github/members",
    "users/../user",
    "repos/o/../../user",
    "users/%2e%2e",
    "",
  ])("rejects %j", async (path) => {
    const res = await handleGitHubProxy(get(path), { GITHUB_TOKEN: "ghp_server" });
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects non-GET requests", async () => {
    const res = await handleGitHubProxy(get("users/octocat", { method: "POST" }), {});
    expect(res.status).toBe(405);
  });
});
