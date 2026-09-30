import { handleGitHubProxy } from "./_lib/githubProxy.js";

// Vercel function: GET /api/github/<path>?<query> (see the rewrite in vercel.json)
export function GET(request: Request) {
  return handleGitHubProxy(request, process.env);
}
