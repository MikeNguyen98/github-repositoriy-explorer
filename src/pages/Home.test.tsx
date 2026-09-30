import { useAuth } from "@/hooks/useAuth";
import { recentSearches } from "@/libs/recentSearches";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

vi.mock("@/hooks/useAuth", () => ({ useAuth: vi.fn() }));

const UserStub = () => <p>profile of {useParams().username}</p>;

function renderHome() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:username" element={<UserStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  recentSearches.clear();
  vi.mocked(useAuth).mockReturnValue({ isSignedIn: false, viewer: undefined, isLoading: false });
});

describe("Home", () => {
  it("searches for a user and remembers the search", async () => {
    renderHome();

    await userEvent.type(screen.getByRole("searchbox", { name: /github username/i }), " torvalds {Enter}");

    expect(await screen.findByText("profile of torvalds")).toBeInTheDocument();
    expect(recentSearches.get()).toEqual(["torvalds"]);
  });

  it("ignores empty searches", async () => {
    renderHome();

    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows suggestions, then recent searches once there are some", async () => {
    const { unmount } = renderHome();
    expect(screen.getByRole("link", { name: "gaearon" })).toBeInTheDocument();
    unmount();

    recentSearches.add("octocat");
    renderHome();

    expect(screen.getByRole("link", { name: "octocat" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /remove octocat/i }));
    expect(screen.queryByRole("link", { name: "octocat" })).not.toBeInTheDocument();
  });

  it("offers to continue as the signed-in user", () => {
    vi.mocked(useAuth).mockReturnValue({
      isSignedIn: true,
      viewer: { login: "me", avatar_url: "" } as never,
      isLoading: false,
    });

    renderHome();

    expect(screen.getByRole("link", { name: /continue as @me/i })).toHaveAttribute("href", "/users/me");
  });
});
