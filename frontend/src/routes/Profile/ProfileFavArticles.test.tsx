import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProfileFavArticles from "./ProfileFavArticles";
import useArticles from "../../hooks/useArticles";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";

vi.mock("../../hooks/useArticles");
vi.mock("../../services/getUser");

const mockedUseArticles = vi.mocked(useArticles);
const mockedGetUser = vi.mocked(getUser);

describe("ProfileFavArticles route", () => {
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

  test("forwards the favorites location and username", () => {
    render(
      <MemoryRouter initialEntries={["/profile/jake/favorites"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/profile/:username/favorites"
              element={<ProfileFavArticles />}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(mockedUseArticles).toHaveBeenCalledWith(
      expect.objectContaining({ location: "favorites", username: "jake" }),
    );
    expect(
      screen.getByText("jake doesn't have favorites."),
    ).toBeInTheDocument();
  });
});
