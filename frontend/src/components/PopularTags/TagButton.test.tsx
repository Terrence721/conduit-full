import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagButton from "./TagButton";
import { useFeedContext } from "../../hooks/useFeedContext";

vi.mock("../../hooks/useFeedContext");

const mockedUseFeedContext = vi.mocked(useFeedContext);

describe("TagButton", () => {
  const changeTab = vi.fn();

  beforeEach(() => {
    changeTab.mockReset();
    mockedUseFeedContext.mockReturnValue({ changeTab } as never);
  });

  test("renders a button for each tag", () => {
    render(<TagButton tagsList={["react", "redux"]} />);

    expect(screen.getByRole("button", { name: "react" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "redux" })).toBeInTheDocument();
  });

  test("changes tab on click", async () => {
    const user = userEvent.setup();

    render(<TagButton tagsList={["react"]} />);

    await user.click(screen.getByRole("button", { name: "react" }));

    expect(changeTab).toHaveBeenCalledWith("tag", "react");
  });
});
