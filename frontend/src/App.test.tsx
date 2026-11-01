import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthContext";
import getUser from "./services/getUser";

vi.mock("./services/getUser");

const mockedGetUser = vi.mocked(getUser);

function Wrapper() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<div>outlet content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders the navbar, outlet and footer", () => {
    render(<Wrapper />);

    expect(screen.getAllByText("conduit")).toHaveLength(2);
    expect(screen.getByText("outlet content")).toBeInTheDocument();
    expect(
      screen.getByText(/interactive learning project/i),
    ).toBeInTheDocument();
  });
});
