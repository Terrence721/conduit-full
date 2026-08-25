import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import getUser from "../services/getUser";
import { emptyAuthState, type AuthState } from "../types";

type AuthContextValue = AuthState & {
  setAuthState: Dispatch<SetStateAction<AuthState>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

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
      .catch(console.error);
  }, [headers]);

  const value = useMemo(() => ({ ...authState, setAuthState }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
