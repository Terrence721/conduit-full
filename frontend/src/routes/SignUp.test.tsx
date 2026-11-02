import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUp from "./SignUp";
import AuthProvider from "../context/AuthContext";
import getUser from "../services/getUser";
import userSignUp from "../services/userSignUp";

vi.mock("../services/getUser");
vi.mock("../services/userSignUp");

const mockedGetUser = vi.mocked(getUser);
const mockedUserSignUp = vi.mocked(userSignUp);

describe("SignUp route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedUserSignUp.mockReset();
    mockedUserSignUp.mockResolvedValue(undefined);
  });

  test("renders the sign-up page", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <SignUp />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Sign up" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign in to your account" }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  test("shows the error message when sign-up fails", async () => {
    mockedUserSignUp.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <AuthProvider>
          <SignUp />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign up" }).closest("form")!,
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
