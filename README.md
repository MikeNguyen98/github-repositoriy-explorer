# GitHub Repository Explorer

A simple GitHub Repository Explorer built with React and TypeScript.

## Features

- Search GitHub users
- View user repositories
- Previous / Next pagination
- Sort repositories by last updated
- View repository details
- Loading, error and empty states
- Responsive UI

## GitHub API

I researched the GitHub REST API and use three main endpoints:

- `GET /users/{username}` — get user information
- `GET /users/{username}/repos` — get repositories with pagination and sorting
- `GET /repos/{owner}/{repo}` — get repository details

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