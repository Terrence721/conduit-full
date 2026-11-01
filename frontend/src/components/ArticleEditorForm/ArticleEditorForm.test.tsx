import { fireEvent, render, screen } from "@testing-library/react";
import useArticleEditorForm from "../../hooks/useArticleEditorForm";
import ArticleEditorForm from "./ArticleEditorForm";

vi.mock("../../hooks/useArticleEditorForm");

const mockedUseArticleEditorForm = vi.mocked(useArticleEditorForm);

function buildForm(overrides = {}) {
  return {
    bodyHandler: vi.fn(),
    descriptionHandler: vi.fn(),
    errorMessage: "",
    form: { body: "", description: "", title: "" },
    formSubmit: vi.fn((event?: { preventDefault?: () => void }) =>
      event?.preventDefault?.(),
    ),
    slug: undefined,
    tagsInput: "",
    tagsInputHandler: vi.fn(),
    titleHandler: vi.fn(),
    ...overrides,
  };
}

describe("ArticleEditorForm", () => {
  beforeEach(() => {
    mockedUseArticleEditorForm.mockReturnValue(
      buildForm() as unknown as unknown as ReturnType<
        typeof useArticleEditorForm
      >,
    );
  });

  test("renders the default publish button and inputs", () => {
    render(<ArticleEditorForm />);

    expect(screen.getByPlaceholderText("Article Title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's this article about?"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your article (in markdown)"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish Article" }),
    ).toBeInTheDocument();
  });

  test("renders Update Article when editing", () => {
    mockedUseArticleEditorForm.mockReturnValue(
      buildForm({ slug: "existing" }) as unknown as ReturnType<
        typeof useArticleEditorForm
      >,
    );

    render(<ArticleEditorForm />);

    expect(
      screen.getByRole("button", { name: "Update Article" }),
    ).toBeInTheDocument();
  });

  test("shows error messages", () => {
    mockedUseArticleEditorForm.mockReturnValue(
      buildForm({ errorMessage: "Title is required" }) as unknown as ReturnType<
        typeof useArticleEditorForm
      >,
    );

    render(<ArticleEditorForm />);

    expect(screen.getByText("Title is required")).toBeInTheDocument();
  });

  test("submits the form", () => {
    const formSubmit = vi.fn((event?: { preventDefault?: () => void }) =>
      event?.preventDefault?.(),
    );
    mockedUseArticleEditorForm.mockReturnValue(
      buildForm({ formSubmit }) as unknown as unknown as ReturnType<
        typeof useArticleEditorForm
      >,
    );

    render(<ArticleEditorForm />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Publish Article" }).closest("form")!,
    );

    expect(formSubmit).toHaveBeenCalled();
  });
});
