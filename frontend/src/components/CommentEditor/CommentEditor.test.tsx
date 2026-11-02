import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import CommentEditor from "./CommentEditor";
import AuthProvider from "../../context/AuthContext";
import postComment from "../../services/postComment";
import getUser from "../../services/getUser";

vi.mock("../../services/postComment");
vi.mock("../../services/getUser");

const mockedPostComment = vi.mocked(postComment);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/article/dragons"]}>
      <AuthProvider>
        <Routes>
          <Route path="/article/:slug" element={children} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const comment = {
  author: { username: "jake" },
  body: "first comment",
  createdAt: "2024-01-01T00:00:00.000Z",
  id: 1,
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("CommentEditor", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedPostComment.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  beforeAll(() => {
    window.alert = vi.fn();
  });

  test("shows the sign-in prompt when logged out", () => {
    render(<CommentEditor updateComments={vi.fn()} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  test("posts a comment when authenticated", async () => {
    const user = userEvent.setup();
    const updateComments = vi.fn();

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
    mockedPostComment.mockResolvedValue(comment as never);

    render(<CommentEditor updateComments={updateComments} />, {
      wrapper: Wrapper,
    });

    await user.type(
      screen.getByPlaceholderText("Write a comment..."),
      comment.body,
    );
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    await waitFor(() => {
      expect(mockedPostComment).toHaveBeenCalledWith({
        body: "first comment",
        headers: { Authorization: "Token abc123" },
        slug: "dragons",
      });
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Write a comment...")).toHaveValue("");
    });

    expect(updateComments).toHaveBeenCalledWith(comment);
  });

  test("does not post an empty comment", async () => {
    const user = userEvent.setup();
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

    render(<CommentEditor updateComments={vi.fn()} />, {
      wrapper: Wrapper,
    });

    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(mockedPostComment).not.toHaveBeenCalled();
  });
});
