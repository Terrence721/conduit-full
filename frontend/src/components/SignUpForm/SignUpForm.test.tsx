import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import SignUpForm from "./SignUpForm";
import AuthProvider from "../../context/AuthContext";
import userSignUp from "../../services/userSignUp";
import getUser from "../../services/getUser";

vi.mock("../../services/userSignUp");
vi.mock("../../services/getUser");

const mockedUserSignUp = vi.mocked(userSignUp);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/register"]}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<>{children}</>} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("SignUpForm", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUserSignUp.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders username, email and password inputs and a sign up button", () => {
    render(
      <Wrapper>
        <SignUpForm onError={() => undefined} />
      </Wrapper>,
    );

    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  test("calls userSignUp with the entered values", async () => {
    mockedUserSignUp.mockResolvedValueOnce(undefined);

    render(
      <Wrapper>
        <SignUpForm onError={() => undefined} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pw" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign up" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mockedUserSignUp).toHaveBeenCalledWith({
        email: "jake@jake.jake",
        password: "pw",
        username: "jake",
      });
    });
  });

  test("navigates home on successful sign up", async () => {
    mockedUserSignUp.mockResolvedValueOnce({
      headers: { Authorization: "Token abc123" },
      isAuth: true,
      loggedUser: {
        bio: null,
        email: "jake@jake.jake",
        image: null,
        token: "abc123",
        username: "jake",
      },
    });

    render(
      <Wrapper>
        <SignUpForm onError={() => undefined} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pw" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign up" }).closest("form")!,
    );

    await waitFor(() => {
      expect(screen.getByText("home")).toBeInTheDocument();
    });
  });

  test("calls onError when sign up fails", async () => {
    mockedUserSignUp.mockResolvedValueOnce(undefined);
    const onError = vi.fn();

    render(
      <Wrapper>
        <SignUpForm onError={onError} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pw" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign up" }).closest("form")!,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });
});
