import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Settings from "./Settings";
import AuthProvider from "../context/AuthContext";
import getUser from "../services/getUser";
import userUpdate from "../services/userUpdate";

vi.mock("../services/getUser");
vi.mock("../services/userUpdate");

const mockedGetUser = vi.mocked(getUser);
const mockedUserUpdate = vi.mocked(userUpdate);

describe("Settings route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedUserUpdate.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders nothing when logged out", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Settings />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Your Settings")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /update settings/i }),
    ).not.toBeInTheDocument();
  });

  test("renders settings form when logged in", async () => {
    const loggedUser = {
      bio: "bio",
      email: "jake@jake.jake",
      image: "img.png",
      token: "abc123",
      username: "jake",
    };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser,
      }),
    );
    mockedGetUser.mockResolvedValue(loggedUser);

    render(
      <MemoryRouter>
        <AuthProvider>
          <Settings />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Your Settings")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("Your Name")).toHaveValue("jake");
  });
});
