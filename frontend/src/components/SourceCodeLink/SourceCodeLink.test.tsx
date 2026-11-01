import { render, screen } from "@testing-library/react";
import SourceCodeLink from "./SourceCodeLink";

describe("SourceCodeLink", () => {
  test("renders a source code link pointing at the repository", () => {
    render(<SourceCodeLink position="right" />);

    const link = screen.getByRole("link", { name: /source code/i });

    expect(link).toHaveAttribute("href");
  });

  test("applies the left position class", () => {
    const { container } = render(<SourceCodeLink position="left" />);

    expect(container.querySelector("ul")).toHaveClass("pull-xs-left");
  });

  test("applies the right position class", () => {
    const { container } = render(<SourceCodeLink position="right" />);

    expect(container.querySelector("ul")).toHaveClass("pull-xs-right");
  });
});
