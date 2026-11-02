import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthContext";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("App", () => {
  test("renders the editorial landing page", () => {
    render(<App />, { wrapper: Wrapper });

    expect(screen.getByText(/ideas worth/i)).toBeInTheDocument();
    expect(screen.getByText(/stories for curious people/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start reading/i }),
    ).toBeInTheDocument();
  });

  test("filters stories by search query", async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    const search = screen.getByPlaceholderText("Search stories");

    await user.type(search, "Elena");

    expect(screen.getAllByText("The case for designing slower")).toHaveLength(
      2,
    );
  });

  test("shows the empty state when search has no matches", async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    await user.type(
      screen.getByPlaceholderText("Search stories"),
      "zzzz-not-a-story",
    );

    expect(screen.getByText("Try another idea.")).toBeInTheDocument();
  });
});
