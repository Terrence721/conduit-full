import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import FeedToggler from "./FeedToggler";
import AuthProvider from "../../context/AuthContext";
import FeedProvider from "../../context/FeedContext";
import getUser from "../../services/getUser";
import type { User } from "../../types";

vi.mock("../../services/getUser");

const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeedProvider>{children}</FeedProvider>
    </AuthProvider>
  );
}

describe("FeedToggler", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("shows only the global tab when logged out", () => {
    render(
      <Wrapper>
        <FeedToggler />
      </Wrapper>,
    );

    expect(
      screen.queryByRole("button", { name: "Your Feed" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Global Feed" }),
    ).toBeInTheDocument();
  });

  test("shows the your-feed tab when logged in", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", token: "abc123" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      username: "jake",
      token: "abc123",
    } as User);

    render(
      <Wrapper>
        <FeedToggler />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Your Feed" }),
      ).toBeInTheDocument();
    });
  });

  test("shows a tag tab only when a tag tab is active", () => {
    render(
      <Wrapper>
        <FeedToggler />
      </Wrapper>,
    );

    expect(
      screen.queryByRole("button", { name: /dragons/i }),
    ).not.toBeInTheDocument();
  });
});
