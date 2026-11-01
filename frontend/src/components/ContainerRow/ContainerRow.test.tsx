import { render, screen } from "@testing-library/react";
import ContainerRow from "./ContainerRow";

describe("ContainerRow", () => {
  test("renders children without the page class by default", () => {
    render(
      <ContainerRow>
        <span>child</span>
      </ContainerRow>,
    );

    expect(screen.getByText("child").parentElement).toHaveClass("row");
    const wrapper = screen.getByText("child").parentElement?.parentElement;
    expect(wrapper).toHaveClass("container");
    expect(wrapper).not.toHaveClass("page");
  });

  test("adds the page class when page is set", () => {
    const { container } = render(
      <ContainerRow page>
        <span>child</span>
      </ContainerRow>,
    );

    expect(container.firstChild).toHaveClass("container", "page");
  });
});
