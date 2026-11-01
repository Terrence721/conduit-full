import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "./NotFound";

describe("NotFound", () => {
  test("renders the not found message and a home link", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByText("404 Not Found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to home page" }),
    ).toHaveAttribute("href", "/");
  });
});
