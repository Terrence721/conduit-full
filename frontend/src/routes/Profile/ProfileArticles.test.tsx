import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProfileArticles from "./ProfileArticles";
import useArticles from "../../hooks/useArticles";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";

vi.mock("../../hooks/useArticles");
vi.mock("../../services/getUser");

const mockedUseArticles = vi.mocked(useArticles);
const mockedGetUser = vi.mocked(getUser);

describe("ProfileArticles route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedUseArticles.mockReturnValue({
      articles: [],
      articlesCount: 0,
      loading: false,
      setArticlesData: vi.fn(),
    });
  });

  test("forwards the profile location and username to ArticlesListView", () => {
    render(
      <MemoryRouter initialEntries={["/profile/jake"]}>
        <AuthProvider>
          <Routes>
            <Route path="/profile/:username" element={<ProfileArticles />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(mockedUseArticles).toHaveBeenCalledWith(
      expect.objectContaining({ location: "profile", username: "jake" }),
    );
    expect(screen.getByText("jake doesn't have articles.")).toBeInTheDocument();
  });
});
