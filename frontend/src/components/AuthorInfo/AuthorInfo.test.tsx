import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthorInfo from "./AuthorInfo";
import AuthProvider from "../../context/AuthContext";
import getProfile from "../../services/getProfile";
import getUser from "../../services/getUser";

vi.mock("../../services/getProfile");
vi.mock("../../services/getUser");

const mockedGetProfile = vi.mocked(getProfile);
const mockedGetUser = vi.mocked(getUser);

describe("AuthorInfo", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetProfile.mockReset();
    mockedGetProfile.mockResolvedValue(undefined);
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders nothing when there is no username param", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <AuthorInfo />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders the username from route state", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/profile/jake",
            state: {
              bio: null,
              followersCount: 0,
              following: false,
              image: null,
            },
          },
        ]}
      >
        <AuthProvider>
          <Routes>
            <Route path="/profile/:username" element={<AuthorInfo />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "jake" })).toBeInTheDocument();
  });

  test("fetches and renders the profile", async () => {
    mockedGetProfile.mockResolvedValueOnce({
      bio: "I work at statefarm",
      followersCount: 2,
      following: false,
      image: null,
      username: "jake",
    });

    render(
      <MemoryRouter initialEntries={["/profile/jake"]}>
        <AuthProvider>
          <Routes>
            <Route path="/profile/:username" element={<AuthorInfo />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("I work at statefarm")).toBeInTheDocument();
    });
  });

  test("shows edit settings for the current user", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", token: "abc123" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/profile/jake",
            state: {
              bio: null,
              followersCount: 0,
              following: false,
              image: null,
            },
          },
        ]}
      >
        <AuthProvider>
          <Routes>
            <Route path="/profile/:username" element={<AuthorInfo />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /edit profile settings/i }),
      ).toBeInTheDocument();
    });
  });

  test("shows a follow button for another user", async () => {
    mockedGetProfile.mockResolvedValueOnce({
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
            <Route path="/profile/:username" element={<AuthorInfo />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /followers/i }),
      ).toBeInTheDocument();
    });
  });
});
