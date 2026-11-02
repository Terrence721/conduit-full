import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import CommentList from "./CommentList";
import AuthProvider from "../../context/AuthContext";
import getComments from "../../services/getComments";
import deleteComment from "../../services/deleteComment";
import getUser from "../../services/getUser";

vi.mock("../../services/getComments");
vi.mock("../../services/deleteComment");
vi.mock("../../services/getUser");

const mockedGetComments = vi.mocked(getComments);
const mockedDeleteComment = vi.mocked(deleteComment);
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

describe("CommentList", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetComments.mockReset();
    mockedDeleteComment.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);

    if (localStorage.getItem("loggedUser")) return;
  });

  beforeAll(() => {
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  test("shows the empty state when there are no comments", async () => {
    mockedGetComments.mockResolvedValue([]);

    render(<CommentList triggerUpdate={{}} updateComments={vi.fn()} />, {
      wrapper: (props) => <Wrapper {...props} />,
    });

    await waitFor(() => {
      expect(
        screen.getByText("There are no comments yet..."),
      ).toBeInTheDocument();
    });
  });

  test("renders fetched comments", async () => {
    mockedGetComments.mockResolvedValue([
      {
        author: {
          bio: null,
          image: null,
          username: "jake",
        },
        body: "Nice post",
        createdAt: "2024-01-01T00:00:00.000Z",
        id: 1,
      } as never,
    ]);

    render(<CommentList triggerUpdate={{}} updateComments={vi.fn()} />, {
      wrapper: (props) => <Wrapper {...props} />,
    });

    await waitFor(() => {
      expect(screen.getByText("Nice post")).toBeInTheDocument();
    });
  });

  test("deletes a comment authored by the current user", async () => {
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
    mockedGetComments.mockResolvedValue([
      {
        author: { bio: null, image: null, username: "jake" },
        body: "Nice post",
        createdAt: "2024-01-01T00:00:00.000Z",
        id: 1,
      } as never,
    ]);
    mockedDeleteComment.mockResolvedValue({ message: "deleted" } as never);

    const updateComments = vi.fn();

    render(<CommentList triggerUpdate={{}} updateComments={updateComments} />, {
      wrapper: (props) => <Wrapper {...props} />,
    });

    await waitFor(() => {
      expect(screen.getByText("Nice post")).toBeInTheDocument();
    });

    await userEvent.setup().click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockedDeleteComment).toHaveBeenCalledWith({
        commentId: 1,
        headers: { Authorization: "Token abc123" },
        slug: "dragons",
      });
    });
    expect(window.confirm).toHaveBeenCalled();
  });
});
