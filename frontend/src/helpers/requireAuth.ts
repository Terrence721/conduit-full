import type { AuthState } from "../types";

type AuthedState = Extract<AuthState, { isAuth: true }>;

function requireAuth(auth: AuthState): AuthedState | null {
  if (auth.isAuth) return auth;

  alert("You need to login first");
  return null;
}

export default requireAuth;
