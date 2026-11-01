import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ArticlesPagination from "./ArticlesPagination";
import AuthProvider from "../../context/AuthContext";
import getArticles from "../../services/getArticles";
import getUser from "../../services/getUser";

vi.mock("../../services/getArticles");
vi.mock("../../services/getUser");

const mockedGetArticles = vi.mocked(getArticles);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("ArticlesPagination", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetArticles.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders nothing when there are no pages", () => {
    const { container } = render(
      <Wrapper>
        <ArticlesPagination
          articlesCount={0}
          location="global"
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders page links for multiple pages", () => {
    render(
      <Wrapper>
        <ArticlesPagination
          articlesCount={10}
          location="global"
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
