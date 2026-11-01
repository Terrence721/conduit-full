import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPageContainer from "./AuthPageContainer";

describe("AuthPageContainer", () => {
  test("renders title, link, children, and an error message", () => {
    render(
      <MemoryRouter>
        <AuthPageContainer
          error="Invalid credentials"
          path="/register"
          text="Need an account?"
          title="Sign in"
        >
          <form>child</form>
        </AuthPageContainer>
      </MemoryRouter>,
    );

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Need an account?" }),
    ).toHaveAttribute("href", "/register");
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  test("renders without an error list when no error is provided", () => {
    render(
      <MemoryRouter>
        <AuthPageContainer
          path="/login"
          text="Have an account?"
          title="Sign up"
        >
          <span>form</span>
        </AuthPageContainer>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/error-messages/)).not.toBeInTheDocument();
    expect(screen.getByText("form")).toBeInTheDocument();
  });
});
