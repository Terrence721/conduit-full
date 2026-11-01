import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Profile from "./Profile";
import AuthProvider from "../../context/AuthContext";
import getProfile from "../../services/getProfile";
import getUser from "../../services/getUser";

vi.mock("../../services/getProfile");
vi.mock("../../services/getUser");

const mockedGetProfile = vi.mocked(getProfile);
const mockedGetUser = vi.mocked(getUser);

describe("Profile route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetProfile.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders the profile navigation", async () => {
    mockedGetProfile.mockResolvedValue({
      bio: null,
      followersCount: 0,
      following: false,
      image: null,
      username: "jake",
    });

    render(
      <MemoryRouter initialEntries={["/profile/jake"]}>
        <AuthProvider>
          <Routes>
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "My Articles" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: "Favorited Articles" }),
    ).toBeInTheDocument();
  });
});
