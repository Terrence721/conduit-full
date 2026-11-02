import { useEffect, useMemo, useState, type ReactNode } from "react";
import getUser from "../services/getUser";
import { AuthContext } from "./AuthContextInstance";
import { emptyAuthState, type AuthState } from "../types";
import errorHandler from "../helpers/errorHandler";

function getStoredAuthState(): AuthState {
  const stored = localStorage.getItem("loggedUser");
  if (!stored) return emptyAuthState;

  try {
    return JSON.parse(stored) as AuthState;
  } catch {
    return emptyAuthState;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(getStoredAuthState);
  const { headers } = authState;

  useEffect(() => {
    if (!headers) return;

    getUser({ headers })
      .then((loggedUser) => {
        if (!loggedUser) return;
        setAuthState((prev) => ({ ...prev, loggedUser }));
      })
      .catch(errorHandler);
  }, [headers]);

  const value = useMemo(() => ({ ...authState, setAuthState }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
