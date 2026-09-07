import type { ChangeEvent } from "react";
import fieldHandler from "./fieldHandler";

interface TestForm {
  body: string;
  title: string;
}

describe("fieldHandler", () => {
  test("updates only the targeted field, preserving the rest", () => {
    const setForm = vi.fn();
    const handler = fieldHandler<TestForm, "title">(setForm, "title");

    handler({
      target: { value: "New Title" },
    } as ChangeEvent<HTMLInputElement>);

    expect(setForm).toHaveBeenCalledTimes(1);
    const updater = setForm.mock.calls[0][0] as (form: TestForm) => TestForm;
    expect(updater({ body: "unchanged", title: "Old Title" })).toEqual({
      body: "unchanged",
      title: "New Title",
    });
  });

  test("reads from a textarea change event the same way", () => {
    const setForm = vi.fn();
    const handler = fieldHandler<TestForm, "body">(setForm, "body");

    handler({
      target: { value: "New body text" },
    } as ChangeEvent<HTMLTextAreaElement>);

    const updater = setForm.mock.calls[0][0] as (form: TestForm) => TestForm;
    expect(updater({ body: "old", title: "T" })).toEqual({
      body: "New body text",
      title: "T",
    });
  });
});
