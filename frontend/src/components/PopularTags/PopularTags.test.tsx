import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import PopularTags from "./PopularTags";
import AuthProvider from "../../context/AuthContext";
import FeedProvider from "../../context/FeedContext";
import getTags from "../../services/getTags";

vi.mock("../../services/getTags");

const mockedGetTags = vi.mocked(getTags);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeedProvider>{children}</FeedProvider>
    </AuthProvider>
  );
}

describe("PopularTags", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetTags.mockReset();
  });

  test("shows a loading message while tags are loading", () => {
    mockedGetTags.mockReturnValue(new Promise(() => undefined));

    render(
      <Wrapper>
        <PopularTags />
      </Wrapper>,
    );

    expect(screen.getByText("Loading tags...")).toBeInTheDocument();
  });

  test("renders tags once they resolve", async () => {
    mockedGetTags.mockResolvedValueOnce(["react", "redux"]);

    render(
      <Wrapper>
        <PopularTags />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "react" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "redux" })).toBeInTheDocument();
  });

  test("shows an unavailable message when tags resolve empty", async () => {
    mockedGetTags.mockResolvedValueOnce([]);

    render(
      <Wrapper>
        <PopularTags />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tags list not available")).toBeInTheDocument();
    });
  });

  test("shows an unavailable message when loading fails", async () => {
    mockedGetTags.mockRejectedValueOnce(new Error("boom"));

    // Avoid noisy console output from the component's catch.
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <Wrapper>
        <PopularTags />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tags list not available")).toBeInTheDocument();
    });
  });
});
