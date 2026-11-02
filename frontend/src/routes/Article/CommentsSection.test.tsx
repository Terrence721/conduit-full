import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import CommentsSection from "./CommentsSection";

vi.mock("../../components/CommentEditor/CommentEditor", () => ({
  default: () => <div>comment editor</div>,
}));
vi.mock("../../components/CommentList/CommentList", () => ({
  default: () => <div>comment list</div>,
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("CommentsSection", () => {
  test("renders the comment editor and list", () => {
    render(<CommentsSection />, { wrapper: Wrapper });

    expect(screen.getByText("comment editor")).toBeInTheDocument();
    expect(screen.getByText("comment list")).toBeInTheDocument();
  });
});
