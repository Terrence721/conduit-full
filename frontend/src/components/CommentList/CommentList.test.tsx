import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import CommentList from "./CommentList";
import AuthProvider from "../../context/AuthContext";
import getComments from "../../services/getComments";
import deleteComment from "../../services/deleteComment";
import getUser from "../../services/getUser";
import type { Comment } from "../../types";

vi.mock("../../services/getComments");
vi.mock("../../services/deleteComment");
vi.mock("../../services/getUser");

const mockedGetComments = vi.mocked(getComments);
const mockedDeleteComment = vi.mocked(deleteComment);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({
  children,
  initialEntries = ["/article/slug"],
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/article/:slug" element={<>{children}</>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const author = {
  bio: null,
  followersCount: 0,
  following: false,
  image: null,
  username: "jake",
};

const comments: Comment[] = [
  {
    author,
    body: "first comment",
    createdAt: "2024-01-01T00:00:00.000Z",
    id: 1,
    updatedAt: "2024-01-01T00:00:00.000Z",
  } as Comment,
];

describe("CommentList", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetComments.mockReset();
    mockedDeleteComment.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows a placeholder when there are no comments", async () => {
    mockedGetComments.mockResolvedValueOnce([]);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("There are no comments yet..."),
      ).toBeInTheDocument();
    });
  });

  test("renders comments with author and body", async () => {
    mockedGetComments.mockResolvedValueOnce(comments);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("first comment")).toBeInTheDocument();
    });
    expect(screen.getByText("jake")).toBeInTheDocument();
  });

  test("shows a delete button for the comment author", async () => {
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

    mockedGetComments.mockResolvedValueOnce(comments);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  test("does not show a delete button for another user", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jane", token: "abc" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jane@jane.jane",
      image: null,
      token: "abc",
      username: "jane",
    });

    mockedGetComments.mockResolvedValueOnce(comments);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("first comment")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("deletes a comment when confirmed", async () => {
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

    mockedGetComments.mockResolvedValueOnce(comments);
    mockedDeleteComment.mockResolvedValueOnce({
      message: { body: ["Comment deleted"] },
    });

    const updateComments = vi.fn();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={updateComments} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockedDeleteComment).toHaveBeenCalledWith({
        commentId: 1,
        headers,
        slug: "slug",
      });
    });

    await waitFor(() => {
      expect(updateComments).toHaveBeenCalled();
    });
  });

  test("does not delete when confirmation is declined", async () => {
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

    mockedGetComments.mockResolvedValueOnce(comments);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    expect(mockedDeleteComment).not.toHaveBeenCalled();
  });

  test("requires authentication to delete", async () => {
    mockedGetComments.mockResolvedValueOnce(comments);

    render(
      <Wrapper>
        <CommentList triggerUpdate={null} updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("first comment")).toBeInTheDocument();
    });

    // No delete button when logged out.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
