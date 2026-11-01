import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";
import type { User } from "../../types";

vi.mock("../../services/getUser");

const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("DropdownMenu", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  function seedAuth() {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", image: "img.png", token: "abc123" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      username: "jake",
      image: "img.png",
      token: "abc123",
    } as User);
  }

  test("renders the logged-in username", async () => {
    seedAuth();

    render(
      <Wrapper>
        <ul>
          <DropdownMenu />
        </ul>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("jake")).toBeInTheDocument();
    });
  });

  test("toggles the dropdown menu on click", async () => {
    seedAuth();

    render(
      <Wrapper>
        <ul>
          <DropdownMenu />
        </ul>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("jake")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("jake"));

    expect(document.querySelector(".dropdown-menu")).not.toBeNull();
  });

  test("logs out and clears stored auth state", async () => {
    seedAuth();

    render(
      <Wrapper>
        <ul>
          <DropdownMenu />
        </ul>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("jake")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("jake"));
    fireEvent.click(screen.getByRole("link", { name: /logout/i }));

    expect(localStorage.getItem("loggedUser")).toBeNull();
  });
});
