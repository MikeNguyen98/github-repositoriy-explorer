# GitHub Repository Explorer

A simple GitHub Repository Explorer built with React and TypeScript.

## Features

- Search GitHub users
- View user repositories
- Previous / Next pagination
- Sort repositories by stars, forks, last pushed or name (asc / desc)
- View repository details
- Loading, error and empty states
- Responsive UI

## GitHub API

- `GET /users/{username}` — user information
- `GET /users/{username}/repos` — repositories sorted by last pushed or name.
  This endpoint only supports `sort=created|updated|pushed|full_name` and silently
  ignores other values, so it cannot sort by stars or forks.
- `GET /search/repositories?q=user:{username} fork:true` — repositories sorted by stars or forks.
  Note: unauthenticated Search API calls are limited to 10 requests/minute.
- `GET /repos/{owner}/{repo}` — repository details

Neither list endpoint returns a total count, so pagination is Prev / Next only.
"Next" is enabled when the response `Link` header contains `rel="next"`.

## Tech Stack

- React + TypeScript + Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS + shadcn/ui
- Vitest

## Architecture

The main flow is:

`UI → TanStack Query → GitHub Service → Axios → GitHub API`

TanStack Query handles server state, while the GitHub service keeps API calls separate from the UI.

## Routes

- `/users/:username` — repository list
- `/users/:username/:repo` — repository details

## Testing

Tests are written with Vitest and cover the main flow from searching for a user to displaying their repositories.

## Getting Started

```bash
pnpm install
pnpm dev
pnpm test
```

## Suggestion improvements
- Save the search history for users.
- Use the GitHub Search Repositories API https://api.github.com/search/repositories to support filtering by repository name and other criteria.
