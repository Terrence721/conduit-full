import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommentAuthor from "./CommentAuthor";

describe("CommentAuthor", () => {
  test("renders the username as a profile link", () => {
    render(
      <MemoryRouter>
        <CommentAuthor
          bio=""
          followersCount={0}
          following={false}
          image=""
          username="jake"
        />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link", { name: "jake" });

    expect(links).toHaveLength(2);
    expect(links[1]).toHaveAttribute("href", "/profile/jake");
  });

  test("renders an avatar using the provided image", () => {
    const { container } = render(
      <MemoryRouter>
        <CommentAuthor
          image="https://example.com/jake.png"
          bio=""
          followersCount={0}
          following={false}
          username="jake"
        />
      </MemoryRouter>,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/jake.png",
    );
  });

  test("renders without an image using the placeholder", () => {
    render(
      <MemoryRouter>
        <CommentAuthor
          bio=""
          followersCount={0}
          following={false}
          image=""
          username="jake"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img")).toHaveAttribute("alt", "jake");
  });
});
