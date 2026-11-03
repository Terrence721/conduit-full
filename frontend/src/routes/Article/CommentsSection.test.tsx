import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import CommentsSection from "./CommentsSection";

vi.mock("../../components/CommentEditor/CommentEditor", () => ({
  default: ({ updateComments }: { updateComments: (u: unknown) => void }) => (
    <button type="button" onClick={() => updateComments({ body: "updated" })}>
      comment editor
    </button>
  ),
}));
vi.mock("../../components/CommentList/CommentList", () => ({
  default: () => <div>comment list</div>,
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("CommentsSection", () => {
  test("renders the comment editor and list", async () => {
    const user = userEvent.setup();
    render(<CommentsSection />, { wrapper: Wrapper });

    expect(screen.getByText("comment editor")).toBeInTheDocument();
    expect(screen.getByText("comment list")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "comment editor" }));
  });
});
