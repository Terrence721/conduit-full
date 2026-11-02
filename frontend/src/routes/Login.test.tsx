import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import AuthProvider from "../context/AuthContext";
import getUser from "../services/getUser";
import userLogin from "../services/userLogin";

vi.mock("../services/getUser");
vi.mock("../services/userLogin");

const mockedGetUser = vi.mocked(getUser);
const mockedUserLogin = vi.mocked(userLogin);

describe("Login route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedUserLogin.mockReset();
    mockedUserLogin.mockResolvedValue(undefined);
  });

  test("renders the sign-in page", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Need an account?" }),
    ).toHaveAttribute("href", "/register");
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  test("shows the error message when login fails", async () => {
    mockedUserLogin.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Login" }).closest("form")!,
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
