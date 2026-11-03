import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsForm from "./SettingsForm";
import useRequireAuthRedirect from "../../hooks/useRequireAuthRedirect";
import userUpdate from "../../services/userUpdate";

vi.mock("../../hooks/useRequireAuthRedirect");
vi.mock("../../services/userUpdate");

const mockedUseRequireAuthRedirect = vi.mocked(useRequireAuthRedirect);
const mockedUserUpdate = vi.mocked(userUpdate);

function authState() {
  return {
    isAuth: true,
    headers: { Authorization: "Token abc123" },
    loggedUser: {
      bio: "bio",
      email: "jake@jake.jake",
      image: "pic.png",
      token: "abc123",
      username: "jake",
    },
    setAuthState: vi.fn(),
    redirectHome: vi.fn(),
  };
}

describe("SettingsForm", () => {
  beforeEach(() => {
    mockedUserUpdate.mockReset();
    mockedUseRequireAuthRedirect.mockReset();
    mockedUseRequireAuthRedirect.mockReturnValue(authState() as never);
  });

  test("renders the current profile values", () => {
    render(<SettingsForm />);

    expect(screen.getByPlaceholderText("Your Name")).toHaveValue("jake");
    expect(screen.getByPlaceholderText("Email")).toHaveValue("jake@jake.jake");
    expect(screen.getByPlaceholderText("URL of profile picture")).toHaveValue(
      "pic.png",
    );
    expect(screen.getByPlaceholderText("Short bio about you")).toHaveValue(
      "bio",
    );
  });

  test("updates settings and calls setAuthState on success", async () => {
    const user = userEvent.setup();
    const auth = authState();
    mockedUseRequireAuthRedirect.mockReturnValue(auth as never);
    mockedUserUpdate.mockResolvedValueOnce(auth.loggedUser as never);

    render(<SettingsForm />);

    await user.clear(screen.getByPlaceholderText("Your Name"));
    await user.type(screen.getByPlaceholderText("Your Name"), "jake-2");
    await user.click(screen.getByRole("button", { name: "Update Settings" }));

    await waitFor(() => {
      expect(mockedUserUpdate).toHaveBeenCalled();
    });
    expect(auth.setAuthState).toHaveBeenCalled();
  });

  test("shows an error message when update fails", async () => {
    const user = userEvent.setup();
    mockedUserUpdate.mockResolvedValueOnce(undefined);

    render(<SettingsForm />);

    await user.click(screen.getByRole("button", { name: "Update Settings" }));

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument();
    });
  });

  test("shows an error message when update throws", async () => {
    const user = userEvent.setup();
    mockedUserUpdate.mockRejectedValueOnce("boom");

    render(<SettingsForm />);

    await user.click(screen.getByRole("button", { name: "Update Settings" }));

    await waitFor(() => {
      expect(screen.getByText("boom")).toBeInTheDocument();
    });
  });

  test("renders nothing when logged out", () => {
    mockedUseRequireAuthRedirect.mockReturnValue({
      isAuth: false,
      headers: undefined,
      loggedUser: {
        username: "",
        email: "",
        token: "",
        bio: null,
        image: null,
      },
      setAuthState: vi.fn(),
      redirectHome: vi.fn(),
    } as never);

    const { container } = render(<SettingsForm />);

    expect(container).toBeEmptyDOMElement();
  });
});
