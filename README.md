# Repo Explorer

Search any GitHub user and explore their repositories — sort by stars, forks or recent activity, filter by name, read READMEs with a language breakdown, and sign in with GitHub to see your private repositories and stars.

**Stack:** React 19 · TypeScript · Vite · TanStack Query · React Router · Tailwind CSS v4 · shadcn/ui (Base UI) · Vitest · Vercel Functions

## Features

- **User profiles** — avatar, bio, links, follower counts and joined date.
- **Repositories that sort properly** — last pushed, name, stars or forks, ascending or descending, with a debounced name filter.
- **Numbered pagination** — real links (shareable, middle-clickable) driven by GitHub's `Link` header.
- **Starred tab** — any user's stars, sorted by star date or last update.
- **Repository page** — stats, README rendered by GitHub (sanitized with DOMPurify), topics, license and a language bar.
- **No rate-limit wall** — anonymous visitors go through a caching server-side proxy (5,000 requests/hour, CDN-cached); signed-in users use their own quota.
- **Sign in with GitHub (Device Flow)** — enter a one-time code on github.com, with no redirects and no client secret, to see your private repositories and stars with a personal 5,000 requests/hour quota.
- **Polish** — dark / light / system theme without a flash on load, recent searches, skeleton loading, empty and error states with retry, per-page document titles, keyboard-accessible, responsive down to 375 px.
- All state that matters lives in the URL (`?tab=starred&sort=stars&direction=asc&page=2&q=cli`), so every view can be bookmarked or shared.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in GITHUB_TOKEN (recommended)
pnpm dev
```

The app runs without any configuration, but anonymous traffic is then limited to 60 requests/hour per IP, and sign-in stays hidden until `VITE_GITHUB_CLIENT_ID` is set.

| Script           | What it does                          |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Dev server with the API functions     |
| `pnpm test`      | Unit and component tests (Vitest)     |
| `pnpm lint`      | ESLint                                |
| `pnpm typecheck` | TypeScript project build              |
| `pnpm build`     | Type-check and production build       |

## Rate limits

| Who                         | Route                                  | Limit                                   |
| --------------------------- | -------------------------------------- | --------------------------------------- |
| Anonymous, no `GITHUB_TOKEN`| `/api/github` → GitHub                 | 60 req/h per server IP                  |
| Anonymous, `GITHUB_TOKEN` set | `/api/github` → GitHub + CDN cache   | 5,000 req/h shared, most hits cached    |
| Signed in                   | Browser → GitHub with the user's token | 5,000 req/h per user                    |

### Server token for anonymous visitors

1. Create a **fine-grained personal access token** at <https://github.com/settings/personal-access-tokens/new>. Leave repository access on *Public repositories* and add **no permissions**; public data is all it needs.
2. Add it to `.env.local` (and to the Vercel project settings for production):

   ```bash
   GITHUB_TOKEN=github_pat_...
   ```

`api/_lib/githubProxy.ts` forwards only the public, read-only endpoints the app uses (`users/*`, `repos/*`, `search/repositories`), rejects everything else, and never forwards `/user`. Successful responses are sent with `Cache-Control: s-maxage=300, stale-while-revalidate=600`, so Vercel's CDN answers repeat requests without touching the quota. Signed-in requests bypass the proxy entirely, so private data never ends up in the shared cache.

The Search API (used for stars/forks sorting and name filtering) has its own, smaller limit: 30 requests/minute per token. The CDN cache absorbs most repeat searches.

## Sign in with GitHub (Device Flow)

Signing in uses GitHub's [Device Flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow): the app shows a one-time code and a link to `github.com/login/device`. The user enters the code there, clicks **Authorize**, and the app signs in on its own, on the page they were already viewing.

1. Create an OAuth App at **GitHub → Settings → Developer settings → OAuth Apps**. Any homepage and callback URL will do, since Device Flow never redirects.
2. On the app's settings page, tick **Enable Device Flow**.
3. Put the client ID in `.env.local` and restart `pnpm dev`:

   ```bash
   VITE_GITHUB_CLIENT_ID=Ov23li...
   ```

No client secret and no per-domain callback URL are needed, so the same app works on localhost, preview deployments and production.

### How it works

```
Browser                     /api/auth/device/* (serverless)          GitHub
───────                     ───────────────────────────────          ──────
Sign in ─ POST code ──────▶ client_id + scope ──────────────────────▶ /login/device/code
show WDJB-MJHT + link ◀──── { user_code, device_code, interval } ◀──
                                       user opens github.com/login/device, enters code, authorizes
every `interval` s:
  POST token ─────────────▶ client_id + device_code ────────────────▶ /login/oauth/access_token
  ◀── pending | slow_down | expired | denied | { access_token }
store token, close dialog
```

- github.com's Device Flow endpoints don't allow CORS, so two thin serverless functions relay the calls (`api/auth/device/code.ts` and `api/auth/device/token.ts`, sharing `api/_lib/deviceFlow.ts`). The Vite dev server mounts the same handlers.
- Polling (`src/hooks/useDeviceFlow.ts`) follows GitHub's rules: it waits `interval` seconds between polls, backs off on `slow_down`, and stops on expiry, denial or when the dialog closes.
- The token is kept in `localStorage` and sent as a `Bearer` header. A `401` signs the user out automatically. Signing in or out clears the query cache so private data never leaks between sessions.
- The default scope is `read:user repo`, because GitHub OAuth Apps have no read-only scope for private repositories. Set `VITE_GITHUB_OAUTH_SCOPE=read:user` to browse public data only, with the higher rate limit.

> **Trade-off:** a token in `localStorage` is readable by any script on the page. Mitigations: README HTML is sanitized before rendering and no third-party scripts are loaded. A stricter setup would keep the token in an httpOnly cookie and proxy every API call through the server.

## GitHub API notes

| Endpoint                                   | Used for                                     |
| ------------------------------------------ | -------------------------------------------- |
| `GET /users/{user}` · `GET /user`          | Profile / signed-in user                     |
| `GET /users/{user}/repos` · `GET /user/repos` | Repositories sorted by last push or name  |
| `GET /search/repositories?q=user:{user} fork:true` | Sorting by stars/forks, filtering by name |
| `GET /users/{user}/starred` · `GET /user/starred` | Starred tab                           |
| `GET /repos/{owner}/{repo}` (+ `/languages`, `/readme`) | Repository page                 |

- The list endpoints only accept `sort=created|updated|pushed|full_name` and **silently ignore anything else**, so stars and forks go through the Search API.
- The Search API caps results at 1,000, can't sort by name (best match is used while filtering), and has its own rate limit (10/min anonymous, 30/min signed in).
- Neither endpoint returns a total for plain listings, so the page count is read from the `rel="last"` entry of the `Link` header.
- The footer shows the remaining core API quota, taken from the `x-ratelimit-*` response headers (the shared server quota for anonymous visitors, the user's own quota when signed in).

## Project structure

```
api/                     Vercel functions: GitHub proxy + Device Flow relay (handlers in api/_lib)
src/
  components/
    layout/              App shell: header, footer, logo
    shared/              Search bar, theme toggle, user menu, error/empty states
    ui/                  shadcn/ui primitives
  features/
    repos/               Query hooks, types, repo card/grid, pager, README, language bar
    users/               Profile card
  hooks/                 useAuth, useTheme, useRecentSearches, useDocumentTitle
  libs/                  Axios client, auth, theme, query client, formatters
  pages/                 Route components (lazy-loaded)
  services/github.ts     All GitHub REST calls
```

Data flows `page → query hook (TanStack Query) → githubService → Axios → GitHub API`. Small global stores (auth, theme, recent searches, rate limit) are plain modules read through `useSyncExternalStore`, so there are no context providers to thread through the tree.

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Vite).
2. Add `GITHUB_TOKEN` and `VITE_GITHUB_CLIENT_ID` as environment variables.
3. Deploy. `vercel.json` maps `/api/github/*` to the proxy function and rewrites every other non-`/api` route to `index.html` for client-side routing.
