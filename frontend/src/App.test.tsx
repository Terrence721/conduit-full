import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  test("renders the editorial landing page", () => {
    render(<App />);

    expect(screen.getByText(/ideas worth/i)).toBeInTheDocument();
    expect(screen.getByText(/stories for curious people/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start reading/i }),
    ).toBeInTheDocument();
  });

  test("filters stories by search query", async () => {
    const user = userEvent.setup();

    render(<App />);

    const search = screen.getByPlaceholderText("Search stories");

    await user.type(search, "Maya");

    expect(
      screen.getAllByText("The quiet craft of designing for trust"),
    ).toHaveLength(2);
  });

  test("shows the empty state when search has no matches", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(
      screen.getByPlaceholderText("Search stories"),
      "zzzz-not-a-story",
    );

    expect(screen.getByText("Try another idea.")).toBeInTheDocument();
  });
});
