import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DropdownItem from "./DropdownItem";

describe("DropdownItem", () => {
  test("renders a link with the provided text", () => {
    render(
      <MemoryRouter>
        <DropdownItem icon="ion-log-in" text="Sign in" url="/login" />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /sign in/i });

    expect(link).toHaveAttribute("href", "/login");
    expect(link).toHaveClass("dropdown-item");
  });

  test("falls back to # when no url is provided", () => {
    render(
      <MemoryRouter>
        <DropdownItem icon="ion-log-out" text="Sign out" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /sign out/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("calls the handler when clicked", () => {
    const handler = vi.fn();

    render(
      <MemoryRouter>
        <DropdownItem handler={handler} icon="ion-gear-a" text="Settings" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("link", { name: /settings/i }));

    expect(handler).toHaveBeenCalled();
  });
});
