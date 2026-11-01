import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import FavButton from "./FavButton";
import toggleFav from "../../services/toggleFav";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";
import type { Article } from "../../types";

vi.mock("../../services/toggleFav");
vi.mock("../../services/getUser");

const mockedToggleFav = vi.mocked(toggleFav);
const mockedGetUser = vi.mocked(getUser);

function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("FavButton", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedToggleFav.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders the favorite count and optional label", () => {
    render(
      <AuthWrapper>
        <FavButton
          favorited={false}
          favoritesCount={5}
          handler={() => undefined}
          slug="slug"
          text
        />
      </AuthWrapper>,
    );

    const button = screen.getByRole("button");

    expect(button).not.toBeDisabled();
    expect(button).toHaveClass("btn-outline-primary");
    expect(button).not.toHaveClass("active");
    expect(screen.getByText("( 5 )")).toBeInTheDocument();
  });

  test("marks the button active when favorited", () => {
    render(
      <AuthWrapper>
        <FavButton
          favorited
          favoritesCount={5}
          handler={() => undefined}
          slug="slug"
        />
      </AuthWrapper>,
    );

    expect(screen.getByRole("button")).toHaveClass("active");
  });

  test("toggles the favorite when authenticated", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({ headers, isAuth: true }),
    );

    const article = { slug: "slug" } as Article;
    const handler = vi.fn();
    mockedToggleFav.mockResolvedValueOnce(article);

    render(
      <AuthWrapper>
        <FavButton
          favorited={false}
          favoritesCount={5}
          handler={handler}
          slug="slug"
        />
      </AuthWrapper>,
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(article);
    });

    expect(mockedToggleFav).toHaveBeenCalledWith({
      favorited: false,
      headers,
      slug: "slug",
    });
  });

  test("does nothing when not authenticated", async () => {
    const handler = vi.fn();

    render(
      <AuthWrapper>
        <FavButton
          favorited={false}
          favoritesCount={5}
          handler={handler}
          slug="slug"
        />
      </AuthWrapper>,
    );

    fireEvent.click(screen.getByRole("button"));

    // Allow any pending microtasks to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedToggleFav).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });
});
