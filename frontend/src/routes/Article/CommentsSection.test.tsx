import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CommentsSection from "./CommentsSection";
import AuthProvider from "../../context/AuthContext";
import getComments from "../../services/getComments";
import getUser from "../../services/getUser";

vi.mock("../../services/getComments");
vi.mock("../../services/getUser");

const mockedGetComments = vi.mocked(getComments);
const mockedGetUser = vi.mocked(getUser);

describe("CommentsSection", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetComments.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedGetComments.mockResolvedValue([]);
  });

  test("renders comment editor sign-in prompt and empty list", async () => {
    render(
      <MemoryRouter initialEntries={["/article/slug"]}>
        <AuthProvider>
          <Routes>
            <Route path="/article/:slug" element={<CommentsSection />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText("There are no comments yet..."),
      ).toBeInTheDocument();
    });
  });

  test("calls getComments with the slug", async () => {
    render(
      <MemoryRouter initialEntries={["/article/slug"]}>
        <AuthProvider>
          <Routes>
            <Route path="/article/:slug" element={<CommentsSection />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockedGetComments).toHaveBeenCalledWith({
        headers: undefined,
        slug: "slug",
      });
    });
  });
});
