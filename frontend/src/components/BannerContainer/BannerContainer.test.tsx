import { render, screen } from "@testing-library/react";
import BannerContainer from "./BannerContainer";

describe("BannerContainer", () => {
  test("renders its children inside the banner container", () => {
    render(
      <BannerContainer>
        <h1>Hello</h1>
      </BannerContainer>,
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hello").parentElement).toHaveClass("container");
  });

  test("renders the banner wrapper", () => {
    const { container } = render(<BannerContainer>content</BannerContainer>);

    expect(container.firstChild).toHaveClass("banner");
  });
});
