import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer", () => {
  test("renders the conduit logo link", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "conduit" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("renders the attribution text", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/interactive learning project/i),
    ).toBeInTheDocument();
  });

  test("renders the source code link", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /source code/i })).toHaveAttribute(
      "href",
    );
  });
});
