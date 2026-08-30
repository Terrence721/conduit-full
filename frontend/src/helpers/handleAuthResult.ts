import type { NavigateFunction } from "react-router-dom";
import type { AuthState } from "../types";

function handleAuthResult(
  authState: AuthState | undefined,
  setAuthState: (authState: AuthState) => void,
  navigate: NavigateFunction,
  onError: (message: string) => void,
): void {
  if (!authState) {
    onError("Something went wrong. Please try again.");
    return;
  }

  setAuthState(authState);
  navigate("/");
}

export default handleAuthResult;
