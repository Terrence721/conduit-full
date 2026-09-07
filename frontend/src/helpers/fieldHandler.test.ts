import type { ChangeEvent } from "react";
import fieldHandler from "./fieldHandler";

interface TestForm {
  body: string;
  title: string;
}

describe("fieldHandler", () => {
  test("updates only the targeted field, preserving the rest", () => {
    const setForm = vi.fn();
    const handler = fieldHandler<TestForm>(setForm)("title");

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

  test("binds setForm once and can build handlers for multiple fields", () => {
    const setForm = vi.fn();
    const bind = fieldHandler<TestForm>(setForm);

    bind("title")({
      target: { value: "T" },
    } as ChangeEvent<HTMLInputElement>);
    bind("body")({
      target: { value: "B" },
    } as ChangeEvent<HTMLTextAreaElement>);

    expect(setForm).toHaveBeenCalledTimes(2);
  });

  test("rejects a non-string field at compile time (regression check)", () => {
    interface WithArrayField {
      tagList: string[];
      title: string;
    }
    const setForm = vi.fn();

    // @ts-expect-error tagList isn't a string field -- fieldHandler only
    // targets string-valued keys, same as the union each original inline
    // version hand-curated before this helper was extracted.
    fieldHandler<WithArrayField>(setForm)("tagList");

    expect(true).toBe(true);
  });
});
