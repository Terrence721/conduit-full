import { render, screen } from "@testing-library/react";
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
});
