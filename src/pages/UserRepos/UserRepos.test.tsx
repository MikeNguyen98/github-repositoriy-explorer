import { useGitUser, useRepos } from "@/features/repos/useRepos";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ReactRouter7Adapter } from "@/libs/ReactRouter7Adapter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryParamProvider } from "use-query-params";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../Home";
import Layout from "@/components/shared/Layout";
import UserRepos from "./UserRepos";

// ---- mock tầng API ----
vi.mock("@/features/repos/useRepos", () => ({
  useGitUser: vi.fn(),
  useRepos: vi.fn(),
}));

vi.mock("@/hooks/useIsMobile", () => ({
  useIsMobile: vi.fn(),
}));

// ---- mock component con để test chỉ tập trung vào luồng ----
vi.mock("../NotFound", () => ({
  default: () => <div data-testid="not-found" />,
}));

vi.mock("./Profile", () => ({
  default: ({ user }: { user: { login: string } }) => (
    <div data-testid="profile">{user.login}</div>
  ),
}));

vi.mock("./Repos", () => ({
  default: ({ data }: { data: { id: number; name: string }[] }) => (
    <ul data-testid="repos">
      {data.map((repo) => (
        <li key={repo.id}>{repo.name}</li>
      ))}
    </ul>
  ),
}));

// Select của shadcn khó thao tác trong jsdom, thay bằng stub rỗng
vi.mock("@/components/ui/select", () => ({
  Select: () => null,
  SelectContent: () => null,
  SelectGroup: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

const mockedUseGitUser = vi.mocked(useGitUser);
const mockedUseRepos = vi.mocked(useRepos);
const mockedUseIsMobile = vi.mocked(useIsMobile);

const NOT_FOUND_USER = "ghost-user";

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <QueryParamProvider adapter={ReactRouter7Adapter}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users/:username" element={<Layout children={<UserRepos/>} />} />
        </Routes>
      </QueryParamProvider>
    </MemoryRouter>,
  );
}

const getInput = () => screen.getByPlaceholderText(/enter a github username/i);
const getSearchButton = () => screen.getByRole("button", { name: /submit/i });

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseIsMobile.mockReturnValue(false);

  // API giả: trả dữ liệu theo username được truyền vào
  mockedUseGitUser.mockImplementation(((username: string) =>
    username === NOT_FOUND_USER
      ? {
          data: undefined,
          isLoading: false,
          isError: true,
          error: Object.assign(new Error("Not Found"), { status: 404 }),
        }
      : {
          data: { login: username },
          isLoading: false,
          isError: false,
          error: null,
        }) as never);

  mockedUseRepos.mockImplementation((({ username }: { username: string }) => ({
    data: [
      { id: 1, name: `${username}-repo-1` },
      { id: 2, name: `${username}-repo-2` },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  })) as never);
});

describe("Search flow: Home -> Layout", () => {
  it("starts on the home page", () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: /welcome to github repository explorer/i }),
    ).toBeTruthy();
    expect(screen.queryByTestId("profile")).not.toBeTruthy();
  });

  it("goes to the user page when clicking Search", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(getInput(), "octocat");
    await user.click(getSearchButton());

    expect((await screen.findByTestId("profile")).textContent).toBe("octocat");
    expect(screen.getByText("octocat-repo-1")).toBeTruthy();
    expect(screen.getByText("octocat-repo-2")).toBeTruthy();
    // đã rời trang Home
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeTruthy();
  });

  it("goes to the user page when pressing Enter", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(getInput(), "torvalds{Enter}");

    expect((await screen.findByTestId("profile")).textContent).toBe("torvalds");
    expect(screen.getByText("torvalds-repo-1")).toBeTruthy();
  });

  it("requests data for the searched username with default params", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(getInput(), "octocat{Enter}");
    await screen.findByTestId("profile");

    expect(mockedUseGitUser).toHaveBeenLastCalledWith("octocat");
    expect(mockedUseRepos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        username: "octocat",
        page: 1,
        sort: "updated",
        direction: "desc",
      }),
    );
  });

  it("shows NotFound when the searched user does not exist", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(getInput(), `${NOT_FOUND_USER}{Enter}`);

    expect(await screen.findByTestId("not-found")).toBeTruthy();
    expect(screen.queryByTestId("profile")).not.toBeTruthy();
  });

  it("stays on the home page when the input is empty", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(getSearchButton());
    await user.type(getInput(), "   {Enter}");

    expect(
      screen.getByRole("heading", { name: /welcome to github repository explorer/i }),
    ).toBeTruthy();
    expect(screen.queryByTestId("profile")).not.toBeTruthy();
    expect(mockedUseGitUser).not.toHaveBeenCalled();
  });

  it("can go back to the home page from the user page", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(getInput(), "octocat{Enter}");
    await screen.findByTestId("profile");

    await user.click(screen.getByRole("link", { name: "Home" }));

    expect(
      await screen.findByRole("heading", { name: /welcome to github repository explorer/i }),
    ).toBeTruthy();
  });
});