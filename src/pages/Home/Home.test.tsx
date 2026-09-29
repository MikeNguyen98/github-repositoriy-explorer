import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./Home";

// SearchBar có test riêng, ở đây chỉ kiểm tra Home có render nó
vi.mock("@/components/shared/SearchBar", () => ({
  default: () => <div data-testid="search-bar" />,
}));

describe("Home", () => {
  it("renders the welcome heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /welcome to github repository explorer/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<Home />);

    expect(
      screen.getByText(/stars, forks, languages and activity/i),
    ).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    render(<Home />);

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
  });
});