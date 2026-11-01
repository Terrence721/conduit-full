import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import AuthProvider from "../../context/AuthContext";
import FeedProvider from "../../context/FeedContext";
import FeedNavLink from "./FeedNavLink";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeedProvider>{children}</FeedProvider>
    </AuthProvider>
  );
}

describe("FeedNavLink", () => {
  test("renders its text", () => {
    render(
      <Wrapper>
        <FeedNavLink name="global" text="Global Feed" />
      </Wrapper>,
    );

    expect(
      screen.getByRole("button", { name: "Global Feed" }),
    ).toBeInTheDocument();
  });

  test("marks the active tab", () => {
    render(
      <Wrapper>
        <FeedNavLink name="global" text="Global Feed" />
      </Wrapper>,
    );

    expect(screen.getByRole("button", { name: "Global Feed" })).toHaveClass(
      "active",
    );
  });

  test("calls changeTab on click", () => {
    render(
      <Wrapper>
        <FeedNavLink name="tag" tagName="dragons" text="dragons" />
        <FeedNavLink name="global" text="Global Feed" />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "dragons" }));

    expect(screen.getByRole("button", { name: "dragons" })).toHaveClass(
      "active",
    );
  });

  test("renders an icon when requested", () => {
    const { container } = render(
      <Wrapper>
        <FeedNavLink icon name="tag" tagName="dragons" text="dragons" />
      </Wrapper>,
    );

    expect(container.querySelector("i.ion-pound")).not.toBeNull();
  });
});
