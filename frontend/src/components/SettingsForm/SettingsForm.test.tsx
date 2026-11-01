import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import SettingsForm from "./SettingsForm";
import type { AuthState } from "../../types";
import AuthProvider from "../../context/AuthContext";
import userUpdate from "../../services/userUpdate";
import getUser from "../../services/getUser";

vi.mock("../../services/userUpdate");
vi.mock("../../services/getUser");

const mockedUserUpdate = vi.mocked(userUpdate);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/settings"]}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("SettingsForm", () => {
  const loggedUser = {
    bio: "bio",
    email: "jake@jake.jake",
    image: "img.png",
    token: "abc123",
    username: "jake",
  };

  beforeEach(() => {
    localStorage.clear();
    mockedUserUpdate.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(loggedUser);
  });

  test("renders nothing when not authenticated", () => {
    mockedGetUser.mockResolvedValue(undefined);

    const { container } = render(
      <Wrapper>
        <SettingsForm />
      </Wrapper>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders fields populated from the logged-in user", async () => {
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser,
      }),
    );

    render(
      <Wrapper>
        <SettingsForm />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Your Name")).toHaveValue("jake");
    });
    expect(screen.getByPlaceholderText("Email")).toHaveValue("jake@jake.jake");
    expect(screen.getByPlaceholderText("Short bio about you")).toHaveValue(
      "bio",
    );
  });

  test("updates settings and calls userUpdate", async () => {
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser,
      }),
    );

    const updated = {
      headers: { Authorization: "Token abc123" },
      isAuth: true,
      loggedUser: { ...loggedUser, bio: "new bio" },
    };
    mockedUserUpdate.mockResolvedValueOnce(updated as AuthState);

    render(
      <Wrapper>
        <SettingsForm />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Your Name")).toHaveValue("jake");
    });

    fireEvent.change(screen.getByPlaceholderText("Short bio about you"), {
      target: { value: "new bio" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /update settings/i }).closest("form")!,
    );

    await waitFor(() => {
      expect(mockedUserUpdate).toHaveBeenCalled();
    });
  });

  test("shows an error message when the update fails", async () => {
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser,
      }),
    );

    mockedUserUpdate.mockResolvedValueOnce(undefined);

    render(
      <Wrapper>
        <SettingsForm />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Your Name")).toHaveValue("jake");
    });

    fireEvent.submit(
      screen.getByRole("button", { name: /update settings/i }).closest("form")!,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument();
    });
  });
});
