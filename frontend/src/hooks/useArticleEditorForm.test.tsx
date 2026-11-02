import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useArticleEditorForm from "./useArticleEditorForm";
import useRequireAuthRedirect from "./useRequireAuthRedirect";
import getArticle from "../services/getArticle";
import setArticle from "../services/setArticle";
import type { Article } from "../types";

vi.mock("./useRequireAuthRedirect");
vi.mock("../services/getArticle");
vi.mock("../services/setArticle");

const mockedGetArticle = vi.mocked(getArticle);
const mockedSetArticle = vi.mocked(setArticle);
const mockedUseRequireAuthRedirect = vi.mocked(useRequireAuthRedirect);

type MockAuth = {
  isAuth: boolean;
  headers: { Authorization: string } | undefined;
  loggedUser: { username: string };
  redirectHome: ReturnType<typeof vi.fn>;
};

function makeAuth(overrides: Partial<MockAuth> = {}): MockAuth {
  return {
    isAuth: true,
    headers: { Authorization: "Token abc123" },
    loggedUser: { username: "jake" },
    redirectHome: vi.fn(),
    ...overrides,
  };
}

function Wrapper({
  children,
  initialEntries = ["/editor"],
}: {
  children: ReactNode;
  initialEntries?: any;
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
}

function SlugWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/editor/dragons"]}>
      <Routes>
        <Route path="/editor/:slug" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  );
}

const article = {
  author: { username: "jake" },
  body: "markdown body",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "description",
  slug: "dragons",
  tagList: ["dragons", "fantasy"],
  title: "Dragons",
  updatedAt: "2024-01-01T00:00:00.000Z",
} as unknown as Article;

function changeEvent(value: string) {
  return { target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("useArticleEditorForm", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetArticle.mockReset();
    mockedSetArticle.mockReset();
    mockedUseRequireAuthRedirect.mockReset();
    mockedUseRequireAuthRedirect.mockReturnValue(makeAuth() as any);
  });

  test("starts with an empty form for a new article", () => {
    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: Wrapper,
    });

    expect(result.current.form).toEqual({
      title: "",
      description: "",
      body: "",
      tagList: [],
    });
    expect(result.current.tagsInput).toBe("");
    expect(result.current.slug).toBeUndefined();
    expect(result.current.errorMessage).toBe("");
  });

  test("updates each field through its handler", () => {
    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.titleHandler(changeEvent("My Title"));
      result.current.descriptionHandler(changeEvent("My description"));
      result.current.bodyHandler(changeEvent("My body"));
    });

    expect(result.current.form).toMatchObject({
      title: "My Title",
      description: "My description",
      body: "My body",
    });
  });

  test("updates the tag input", () => {
    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.tagsInputHandler(changeEvent("dragons, fantasy"));
    });

    expect(result.current.tagsInput).toBe("dragons, fantasy");
  });

  test("hydration from router state populates the form", () => {
    const state = {
      title: "Seeded title",
      description: "Seeded description",
      body: "Seeded body",
      tagList: ["x", "y"],
    };

    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[{ pathname: "/editor", state }]}>
          {children}
        </MemoryRouter>
      ),
    });

    expect(result.current.form).toEqual(state);
    expect(result.current.tagsInput).toBe("x y");
  });

  test("fetches and populates the form for an existing slug owned by the user", async () => {
    mockedGetArticle.mockResolvedValueOnce(article);

    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: SlugWrapper,
    });

    await waitFor(() => {
      expect(mockedGetArticle).toHaveBeenCalledWith({
        headers: { Authorization: "Token abc123" },
        slug: "dragons",
      });
    });

    await waitFor(() => {
      expect(result.current.form.title).toBe("Dragons");
    });
    expect(result.current.tagsInput).toBe("dragons fantasy");
    expect(result.current.slug).toBe("dragons");
  });

  test("redirects home when the existing article is owned by someone else", async () => {
    const redirectHome = vi.fn();
    mockedUseRequireAuthRedirect.mockReturnValue(
      makeAuth({ loggedUser: { username: "mallory" }, redirectHome }) as any,
    );
    mockedGetArticle.mockResolvedValueOnce(article);

    renderHook(() => useArticleEditorForm(), {
      wrapper: SlugWrapper,
    });

    await waitFor(() => {
      expect(redirectHome).toHaveBeenCalled();
    });
  });

  test("does not fetch when there is no slug or no auth", async () => {
    mockedUseRequireAuthRedirect.mockReturnValue(
      makeAuth({ isAuth: false }) as any,
    );

    renderHook(() => useArticleEditorForm(), {
      wrapper: SlugWrapper,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockedGetArticle).not.toHaveBeenCalled();
  });

  test("submits a new article and navigates to it", async () => {
    mockedSetArticle.mockResolvedValueOnce("dragons");

    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.titleHandler(changeEvent("Dragons"));
      result.current.descriptionHandler(changeEvent("description"));
      result.current.bodyHandler(changeEvent("markdown body"));
      result.current.tagsInputHandler(changeEvent("dragons fantasy"));
    });

    await act(async () => {
      await result.current.formSubmit({
        preventDefault: vi.fn(),
      } as any);
    });

    expect(mockedSetArticle).toHaveBeenCalledWith({
      body: "markdown body",
      description: "description",
      headers: { Authorization: "Token abc123" },
      slug: undefined,
      tagList: ["dragons", "fantasy"],
      title: "Dragons",
    });
  });

  test("records an error when submission fails", async () => {
    const failure = new Error("boom");
    mockedSetArticle.mockRejectedValueOnce(failure);

    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.formSubmit({
        preventDefault: vi.fn(),
      } as any);
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe(failure);
    });
  });

  test("does nothing when not authenticated", async () => {
    mockedUseRequireAuthRedirect.mockReturnValue(
      makeAuth({ isAuth: false, headers: undefined }) as any,
    );

    const { result } = renderHook(() => useArticleEditorForm(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.formSubmit({
        preventDefault: vi.fn(),
      } as any);
    });

    expect(mockedSetArticle).not.toHaveBeenCalled();
  });
});