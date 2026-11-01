import { fireEvent, render, screen } from "@testing-library/react";
import FormFieldset from "./FormFieldset";

describe("FormFieldset", () => {
  test("renders an input with the given value and placeholder", () => {
    render(
      <FormFieldset
        handler={() => undefined}
        name="email"
        placeholder="Email"
        value="jake@jake.jake"
      />,
    );

    const input = screen.getByRole("textbox");

    expect(input).toHaveValue("jake@jake.jake");
    expect(input).toHaveAttribute("placeholder", "Email");
    expect(input).toHaveAttribute("name", "email");
  });

  test("calls the change handler when the value changes", () => {
    const handler = vi.fn();

    render(<FormFieldset handler={handler} name="email" value="" />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "new@jake.jake" },
    });

    expect(handler).toHaveBeenCalled();
  });

  test("uses the large control class by default", () => {
    render(<FormFieldset handler={() => undefined} name="email" value="" />);

    expect(screen.getByRole("textbox")).toHaveClass("form-control-lg");
  });

  test("omits the large control class when normal is set", () => {
    render(
      <FormFieldset handler={() => undefined} name="email" normal value="" />,
    );

    expect(screen.getByRole("textbox")).not.toHaveClass("form-control-lg");
    expect(screen.getByRole("textbox")).toHaveClass("form-control");
  });

  test("forwards type, required, minLength and autoFocus props", () => {
    const { container } = render(
      <FormFieldset
        autoFocus
        handler={() => undefined}
        minLength={8}
        name="password"
        required
        type="password"
        value=""
      />,
    );

    const input = container.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;

    expect(input).toHaveAttribute("type", "password");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("minLength", "8");
  });
});
