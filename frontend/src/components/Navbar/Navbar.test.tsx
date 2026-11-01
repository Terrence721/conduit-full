import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";

vi.mock("../../services/getUser");

const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("shows login and sign up links when logged out", () => {
    render(
      <Wrapper>
        <Navbar />
      </Wrapper>,
    );

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "New Article" }),
    ).not.toBeInTheDocument();
  });

  test("shows new article and a dropdown when logged in", async () => {
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
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });

    render(
      <Wrapper>
        <Navbar />
      </Wrapper>,
    );

    await screen.findByText("jake");

    expect(
      screen.getByRole("link", { name: "New Article" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Login" }),
    ).not.toBeInTheDocument();
  });
});
