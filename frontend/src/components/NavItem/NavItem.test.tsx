import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavItem from "./NavItem";

describe("NavItem", () => {
  test("renders a link with the provided text and url", () => {
    render(
      <MemoryRouter>
        <NavItem text="Home" url="/home" />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Home" });

    expect(link).toHaveAttribute("href", "/home");
  });

  test("renders an icon when provided", () => {
    const { container } = render(
      <MemoryRouter>
        <NavItem icon="ion-gear-a" text="Settings" url="/settings" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(container.querySelector("i.ion-gear-a")).not.toBeNull();
  });

  test("passes navigation state through", () => {
    render(
      <MemoryRouter>
        <NavItem state={{ from: "menu" }} text="Profile" url="/profile" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  });
});
