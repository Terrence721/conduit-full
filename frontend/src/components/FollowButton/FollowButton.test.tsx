import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import FollowButton from "./FollowButton";
import AuthProvider from "../../context/AuthContext";
import toggleFollow from "../../services/toggleFollow";
import getUser from "../../services/getUser";
import type { Profile } from "../../types";

vi.mock("../../services/toggleFollow");
vi.mock("../../services/getUser");

const mockedToggleFollow = vi.mocked(toggleFollow);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("FollowButton", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedToggleFollow.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("shows Followers (no action) when logged out", () => {
    render(
      <Wrapper>
        <FollowButton
          followersCount={3}
          following={false}
          handler={() => undefined}
          username="jake"
        />
      </Wrapper>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("Followers");
    expect(screen.getByRole("button")).toHaveTextContent("( 3 )");
  });

  test("shows Follow and username when logged in and not following", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jane" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jane@jane.jane",
      image: null,
      token: "abc123",
      username: "jane",
    });

    render(
      <Wrapper>
        <FollowButton
          followersCount={3}
          following={false}
          handler={() => undefined}
          username="jake"
        />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Follow");
    });
    expect(screen.getByRole("button")).toHaveTextContent("jake");
  });

  test("shows Unfollow when following", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jane" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jane@jane.jane",
      image: null,
      token: "abc123",
      username: "jane",
    });

    render(
      <Wrapper>
        <FollowButton
          followersCount={3}
          following
          handler={() => undefined}
          username="jake"
        />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Unfollow");
    });
  });

  test("toggles follow when authenticated", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jane" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jane@jane.jane",
      image: null,
      token: "abc123",
      username: "jane",
    });

    const profile = { username: "jake" } as Profile;
    const handler = vi.fn();
    mockedToggleFollow.mockResolvedValueOnce(profile);

    render(
      <Wrapper>
        <FollowButton
          followersCount={3}
          following={false}
          handler={handler}
          username="jake"
        />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(profile);
    });

    expect(mockedToggleFollow).toHaveBeenCalledWith({
      following: false,
      headers,
      username: "jake",
    });
  });

  test("does nothing when not authenticated", async () => {
    const handler = vi.fn();

    render(
      <Wrapper>
        <FollowButton
          followersCount={3}
          following={false}
          handler={handler}
          username="jake"
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedToggleFollow).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });
});
