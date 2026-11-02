import { createContext } from "react";
import type { AuthState } from "../types";
import type { Dispatch, SetStateAction } from "react";

type AuthContextValue = AuthState & {
  setAuthState: Dispatch<SetStateAction<AuthState>>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
