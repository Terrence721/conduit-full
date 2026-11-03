import { render, screen, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import AuthProvider from "../context/AuthContext";
import useRequireAuthRedirect from "./useRequireAuthRedirect";

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function Consumer() {
  useRequireAuthRedirect();
  return null;
}

function Wrapper({
  children,
  initialEntries,
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries ?? ["/editor"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="*"
            element={
              <>
                {children}
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("useRequireAuthRedirect", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns auth state and redirectHome when logged in", () => {
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser: { username: "jake", token: "abc123" },
      }),
    );

    const { result } = renderHook(() => useRequireAuthRedirect(), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      ),
    });

    expect(result.current.isAuth).toBe(true);
    expect(typeof result.current.redirectHome).toBe("function");
  });

  test("redirects home when logged out", async () => {
    render(
      <Wrapper initialEntries={["/editor"]}>
        <Consumer />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/");
    });
  });
});
