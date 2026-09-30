/**
 * Read-only proxy to the GitHub REST API for anonymous visitors.
 *
 * Anonymous browser requests are limited to 60/hour per IP. Routing them
 * through here attaches a server-side token (5,000/hour) and lets the CDN
 * cache responses, so many visitors share one cached answer.
 *
 * Signed-in users never come through here: they call GitHub directly with
 * their own token, so private data never reaches this shared cache.
 */
type Env = Record<string, string | undefined>;

const SEGMENT = "[A-Za-z0-9_.-]+";
// Only the public, read-only endpoints the app uses — never an open proxy.
const ALLOWED = [
  new RegExp(`^users/${SEGMENT}(/(repos|starred))?$`),
  new RegExp(`^repos/${SEGMENT}/${SEGMENT}(/(languages|readme))?$`),
  /^search\/repositories$/,
];

const FORWARDED_HEADERS = [
  "content-type",
  "link",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
  "x-ratelimit-resource",
];

const ACCEPT_HTML = "application/vnd.github.html+json";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function handleGitHubProxy(request: Request, env: Env) {
  if (request.method !== "GET") return json({ message: "Method not allowed." }, 405);

  const url = new URL(request.url);
  const path = (url.searchParams.get("path") ?? "").replace(/^\/+|\/+$/g, "");
  url.searchParams.delete("path");

  const dotSegment = path.split("/").some((s) => /^\.+$/.test(s));
  if (dotSegment || !ALLOWED.some((re) => re.test(path))) {
    return json({ message: "Not found." }, 404);
  }

  const query = url.searchParams.toString();
  const token = env.GITHUB_TOKEN;
  const upstream = await fetch(`https://api.github.com/${path}${query ? `?${query}` : ""}`, {
    headers: {
      Accept:
        request.headers.get("accept") === ACCEPT_HTML ? ACCEPT_HTML : "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "repo-explorer",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set(
    "Cache-Control",
    upstream.ok
      ? // browsers keep it 1 min; the CDN 5 min, then serves stale while refreshing
        "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      : "no-store",
  );
  headers.set("Vary", "Accept");

  return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers });
}
