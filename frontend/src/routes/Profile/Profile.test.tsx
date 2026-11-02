import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import Profile from "./Profile";
import AuthProvider from "../../context/AuthContext";
import getProfile from "../../services/getProfile";
import getUser from "../../services/getUser";

vi.mock("../../services/getProfile");
vi.mock("../../services/getUser");

const mockedGetProfile = vi.mocked(getProfile);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/profile/jake"]}>
      <AuthProvider>
        <Routes>
          <Route path="/profile/:username" element={children} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Profile route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetProfile.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("shows the username and edit link for the signed-in user", async () => {
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser: { username: "jake" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });
    mockedGetProfile.mockResolvedValue({
      bio: "Bio",
      followersCount: 2,
      following: false,
      image: null,
      username: "jake",
    });

    render(<Profile />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("jake")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: "Edit Profile Settings" }),
    ).toBeInTheDocument();
  });

  test("renders another user's follow control", async () => {
    mockedGetProfile.mockResolvedValue({
      bio: "Bio",
      followersCount: 4,
      following: false,
      image: null,
      username: "jane",
    });

    render(<Profile />, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={["/profile/jane"]}>
          <AuthProvider>
            <Routes>
              <Route path="/profile/:username" element={children} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      ),
    });

    await waitFor(() => {
      expect(screen.getByText("jane")).toBeInTheDocument();
    });

    expect(screen.getByText("( 4 )")).toBeInTheDocument();
  });
});
