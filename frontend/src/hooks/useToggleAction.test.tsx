import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import useToggleAction from "./useToggleAction";
import AuthProvider from "../context/AuthContext";
import getUser from "../services/getUser";

vi.mock("../services/getUser");

const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useToggleAction", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    window.alert = vi.fn();
  });

  test("prompts to log in and does nothing when unauthenticated", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useToggleAction(handler), {
      wrapper: Wrapper,
    });

    const action = vi.fn();
    act(() => {
      result.current.toggle(action);
    });

    expect(window.alert).toHaveBeenCalledWith("You need to login first");
    expect(action).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  test("runs the action and calls the handler with its result", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({ headers, isAuth: true }),
    );

    const handler = vi.fn();
    const { result } = renderHook(() => useToggleAction(handler), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const action = vi.fn().mockResolvedValue("done" as unknown as undefined);
    act(() => {
      result.current.toggle(action);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(action).toHaveBeenCalledWith(headers);
    expect(handler).toHaveBeenCalledWith("done");
  });

  test("logs the error and resets loading when the action rejects", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({ headers, isAuth: true }),
    );

    const handler = vi.fn();
    const { result } = renderHook(() => useToggleAction(handler), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const action = vi.fn().mockRejectedValue(new Error("boom"));

    act(() => {
      result.current.toggle(action);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(handler).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
