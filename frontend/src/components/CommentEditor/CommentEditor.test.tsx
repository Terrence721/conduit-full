import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import CommentEditor from "./CommentEditor";
import AuthProvider from "../../context/AuthContext";
import postComment from "../../services/postComment";
import getUser from "../../services/getUser";
import type { Comment } from "../../types";

vi.mock("../../services/postComment");
vi.mock("../../services/getUser");

const mockedPostComment = vi.mocked(postComment);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/article/slug"]}>
      <AuthProvider>
        <Routes>
          <Route path="/article/:slug" element={<>{children}</>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("CommentEditor", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedPostComment.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("prompts unauthenticated users to sign in", () => {
    render(
      <Wrapper>
        <CommentEditor updateComments={() => undefined} />
      </Wrapper>,
    );

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  test("renders the editor when authenticated", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", image: null, token: "abc123" },
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
      <Wrapper>
        <CommentEditor updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Write a comment..."),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /post comment/i }),
    ).toBeInTheDocument();
  });

  test("does not submit an empty comment", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", image: null, token: "abc123" },
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
      <Wrapper>
        <CommentEditor updateComments={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Write a comment..."),
      ).toBeInTheDocument();
    });

    fireEvent.submit(
      screen.getByRole("button", { name: /post comment/i }).closest("form")!,
    );

    expect(mockedPostComment).not.toHaveBeenCalled();
  });

  test("posts a comment and calls updateComments", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", image: null, token: "abc123" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });

    const comment = { body: "nice", id: 1 } as Comment;
    mockedPostComment.mockResolvedValueOnce(comment);

    const updateComments = vi.fn();

    render(
      <Wrapper>
        <CommentEditor updateComments={updateComments} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Write a comment..."),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "nice" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /post comment/i }).closest("form")!,
    );

    await waitFor(() => {
      expect(updateComments).toHaveBeenCalledWith(comment);
    });

    expect(mockedPostComment).toHaveBeenCalledWith({
      body: "nice",
      headers,
      slug: "slug",
    });
  });
});
