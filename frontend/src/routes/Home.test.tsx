import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import AuthProvider from "../context/AuthContext";
import getUser from "../services/getUser";
import getTags from "../services/getTags";

vi.mock("../services/getUser");
vi.mock("../services/getTags");

const mockedGetUser = vi.mocked(getUser);
const mockedGetTags = vi.mocked(getTags);

describe("Home route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedGetTags.mockReset();
    mockedGetTags.mockReturnValue(new Promise(() => undefined));
  });

  test("shows the banner for logged-out users", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("A place to share your knowledge."),
    ).toBeInTheDocument();
  });

  test("hides the banner for logged-in users", async () => {
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
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.queryByText("A place to share your knowledge."),
      ).not.toBeInTheDocument();
    });
  });

  test("renders the popular tags sidebar", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Popular Tags")).toBeInTheDocument();
  });
});
