import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";
import path from "path";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { handleGitHubProxy } from "./api/_lib/githubProxy.ts";
import { handleDeviceCode, handleDeviceToken } from "./api/_lib/deviceFlow.ts";

type Handler = (request: Request, env: Record<string, string>) => Promise<Response>;

async function toRequest(req: IncomingMessage, url: string) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
  });
}

/** Serves the api/ functions during `vite dev`, mirroring the Vercel deployment. */
function devApi(env: Record<string, string>): Plugin {
  const routes: [string, Handler, (rest: string) => string][] = [
    ["/api/auth/device/code", handleDeviceCode, () => "http://localhost/api/auth/device/code"],
    ["/api/auth/device/token", handleDeviceToken, () => "http://localhost/api/auth/device/token"],
    [
      "/api/github",
      handleGitHubProxy,
      // same shape as the vercel.json rewrite: /api/github/<path>?q → ?path=<path>&q
      (rest) => {
        const [pathname, query = ""] = rest.split("?");
        const params = new URLSearchParams(query);
        params.set("path", pathname);
        return `http://localhost/api/github?${params}`;
      },
    ],
  ];

  return {
    name: "dev-api",
    configureServer(server) {
      if (!env.GITHUB_TOKEN) {
        server.config.logger.warn(
          "GITHUB_TOKEN is not set — anonymous API calls are limited to 60/hour. See README.",
        );
      }
      for (const [mount, handler, toUrl] of routes) {
        server.middlewares.use(mount, async (req, res) => {
          const response = await handler(await toRequest(req, toUrl(req.url ?? "")), env);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devApi(loadEnv(mode, process.cwd(), ""))],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
}));
