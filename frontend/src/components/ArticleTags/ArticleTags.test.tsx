import { render, screen } from "@testing-library/react";
import ArticleTags from "./ArticleTags";

describe("ArticleTags", () => {
  test("renders nothing when tagList is empty", () => {
    const { container } = render(<ArticleTags tagList={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("renders one pill per tag", () => {
    render(<ArticleTags tagList={["react", "redux"]} />);

    const items = screen.getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("react");
    expect(items[1]).toHaveTextContent("redux");
  });

  test("renders a single tag", () => {
    render(<ArticleTags tagList={["dragons"]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
