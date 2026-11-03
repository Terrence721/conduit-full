import { vi } from "vitest";
import handleAuthResult from "./handleAuthResult";

describe("handleAuthResult", () => {
  test("sets auth state and navigates home on a valid result", () => {
    const authState = { isAuth: true } as never;
    const setAuthState = vi.fn();
    const navigate = vi.fn();
    const onError = vi.fn();

    handleAuthResult(authState, setAuthState, navigate, onError);

    expect(setAuthState).toHaveBeenCalledWith(authState);
    expect(navigate).toHaveBeenCalledWith("/home");
    expect(onError).not.toHaveBeenCalled();
  });

  test("reports an error when the result is missing", () => {
    const setAuthState = vi.fn();
    const navigate = vi.fn();
    const onError = vi.fn();

    handleAuthResult(undefined as never, setAuthState, navigate, onError);

    expect(setAuthState).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
    );
  });
});
