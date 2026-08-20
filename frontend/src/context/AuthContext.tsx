import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import getUser from "../services/getUser";
import type { AuthState } from "../types";

interface AuthContextValue extends AuthState {
  setAuthState: Dispatch<SetStateAction<AuthState>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

const initialAuthState: AuthState = {
  headers: null,
  isAuth: false,
  loggedUser: {
    username: "",
    bio: null,
    image: null,
    email: "",
    token: "",
  },
};

function getStoredAuthState(): AuthState {
  const stored = localStorage.getItem("loggedUser");
  if (!stored) return initialAuthState;

  try {
    return JSON.parse(stored) as AuthState;
  } catch {
    return initialAuthState;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [{ headers, isAuth, loggedUser }, setAuthState] =
    useState<AuthState>(getStoredAuthState);

  useEffect(() => {
    if (!headers) return;

    getUser({ headers })
      .then((loggedUser) => {
        if (!loggedUser) return;
        setAuthState((prev) => ({ ...prev, loggedUser }));
      })
      .catch(console.error);
  }, [headers]);

  return (
    <AuthContext.Provider value={{ headers, isAuth, loggedUser, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
