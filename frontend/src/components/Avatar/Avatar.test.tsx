import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  test("uses the bundled placeholder image and alt by default", () => {
    render(<Avatar />);

    const image = screen.getByRole("img");

    expect(image).toHaveAttribute("alt", "placeholder");
    expect(image).toHaveAttribute("src");
    expect(image).toHaveAttribute("class", "");
  });

  test("renders a provided src", () => {
    render(<Avatar src="https://example.com/avatar.png" />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/avatar.png",
    );
  });

  test("falls back to the placeholder image when src is null", () => {
    render(<Avatar src={null} />);

    const image = screen.getByRole("img");

    expect(image).toHaveAttribute("src");
    expect(image.getAttribute("src")).not.toBe("null");
  });

  test("uses custom alt text and className when provided", () => {
    render(<Avatar alt="Jake's avatar" className="user-pic" />);

    const image = screen.getByRole("img");

    expect(image).toHaveAttribute("alt", "Jake's avatar");
    expect(image).toHaveAttribute("class", "user-pic");
  });
});
