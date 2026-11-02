import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthContext";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as unknown as typeof window.requestAnimationFrame;
});

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

  test("switches feed tabs", async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    await user.click(screen.getByRole("tab", { name: "Following" }));

    expect(screen.getByRole("tab", { name: "Following" })).toHaveClass(/active/);
  });

  test("filters by a topic and clears it", async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    const topicButton = Array.from(document.querySelectorAll(".topic-strip button")).find(
      (button) => button.textContent?.includes("Design"),
    ) as HTMLButtonElement;
    await user.click(topicButton);

    await waitFor(() => {
      expect(document.querySelector(".active-filter")).not.toBeNull();
    });

    const clearButton = document.querySelector(".active-filter") as HTMLButtonElement;
    await user.click(clearButton);

    expect(document.querySelector(".active-filter")).toBeNull();
  });

  test("opens the featured story and returns to the feed", async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole("button", { name: /read featured story/i }),
    );

    expect(
      screen.getByRole("heading", {
        name: /the case for designing slower/i,
        level: 1,
      }),
    ).toBeInTheDocument();

    const backButton = [...screen.getAllByRole("button", {
      name: "Back to stories",
    })].find((button) => button.classList.contains("join-button"))!;

    await user.click(backButton);

    expect(screen.getByText(/stories for curious people/i)).toBeInTheDocument();
  });

  test("toggles saving the featured story", async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole("button", { name: /read featured story/i }),
    );

    await user.click(screen.getByRole("button", { name: "Save story" }));

    expect(
      screen.getByRole("button", { name: "Saved" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Saved" }));

    expect(
      screen.getByRole("button", { name: "Save story" }),
    ).toBeInTheDocument();
  });
});
