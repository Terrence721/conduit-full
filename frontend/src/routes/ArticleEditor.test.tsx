import { render, screen } from "@testing-library/react";
import ArticleEditor from "./ArticleEditor";
import useArticleEditorForm from "../hooks/useArticleEditorForm";

vi.mock("../hooks/useArticleEditorForm");

const mockedUseArticleEditorForm = vi.mocked(useArticleEditorForm);

describe("ArticleEditor route", () => {
  beforeEach(() => {
    mockedUseArticleEditorForm.mockReturnValue({
      bodyHandler: () => undefined,
      descriptionHandler: () => undefined,
      errorMessage: "",
      form: { body: "", description: "", title: "" },
      formSubmit: () => undefined,
      slug: undefined,
      tagsInput: "",
      tagsInputHandler: () => undefined,
      titleHandler: () => undefined,
    } as unknown as ReturnType<typeof useArticleEditorForm>);
  });

  test("renders the article editor form", () => {
    render(<ArticleEditor />);

    expect(screen.getByPlaceholderText("Article Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish Article" }),
    ).toBeInTheDocument();
  });
});
