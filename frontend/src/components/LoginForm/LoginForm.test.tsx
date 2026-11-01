import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import LoginForm from "./LoginForm";
import AuthProvider from "../../context/AuthContext";
import userLogin from "../../services/userLogin";
import getUser from "../../services/getUser";

vi.mock("../../services/userLogin");
vi.mock("../../services/getUser");

const mockedUserLogin = vi.mocked(userLogin);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<>{children}</>} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUserLogin.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders email and password inputs and a login button", () => {
    render(
      <Wrapper>
        <LoginForm onError={() => undefined} />
      </Wrapper>,
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  test("calls userLogin with the entered credentials", async () => {
    mockedUserLogin.mockResolvedValueOnce(undefined);

    render(
      <Wrapper>
        <LoginForm onError={() => undefined} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pw" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Login" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mockedUserLogin).toHaveBeenCalledWith({
        email: "jake@jake.jake",
        password: "pw",
      });
    });
  });

  test("navigates home on successful login", async () => {
    mockedUserLogin.mockResolvedValueOnce({
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
        <LoginForm onError={() => undefined} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pw" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Login" }).closest("form")!,
    );

    await waitFor(() => {
      expect(screen.getByText("home")).toBeInTheDocument();
    });
  });

  test("calls onError when login fails", async () => {
    mockedUserLogin.mockResolvedValueOnce(undefined);
    const onError = vi.fn();

    render(
      <Wrapper>
        <LoginForm onError={onError} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "jake@jake.jake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pw" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Login" }).closest("form")!,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });
});
