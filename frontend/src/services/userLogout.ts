import { emptyAuthState, type AuthState } from "../types";

function userLogout(): AuthState {
  localStorage.removeItem("loggedUser");

  return emptyAuthState;
}

export default userLogout;
