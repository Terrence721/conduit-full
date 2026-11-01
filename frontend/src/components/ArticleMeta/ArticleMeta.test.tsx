import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ArticleMeta from "./ArticleMeta";

const author = {
  bio: null,
  followersCount: 0,
  following: false,
  image: "https://example.com/jake.png",
  username: "jake",
};

describe("ArticleMeta", () => {
  test("renders the author name and date", () => {
    render(
      <MemoryRouter>
        <ArticleMeta author={author} createdAt="2024-01-01T00:00:00.000Z">
          <button>Favorite</button>
        </ArticleMeta>
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link", { name: "jake" });

    expect(links).toHaveLength(2);
    expect(links[1]).toHaveAttribute("href", "/profile/jake");
    expect(screen.getByText("Favorite")).toBeInTheDocument();
    expect(document.querySelector(".date")).not.toBeNull();
  });

  test("renders children", () => {
    render(
      <MemoryRouter>
        <ArticleMeta author={author} createdAt="2024-01-01T00:00:00.000Z">
          <span>controls</span>
        </ArticleMeta>
      </MemoryRouter>,
    );

    expect(screen.getByText("controls")).toBeInTheDocument();
  });
});
