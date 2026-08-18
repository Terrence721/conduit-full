import type { AuthState } from "../types";

function userLogout(): AuthState {
  localStorage.removeItem("loggedUser");

  return {
    headers: null,
    isAuth: false,
    loggedUser: {
      bio: null,
      email: "",
      image: null,
      token: "",
      username: "",
    },
  };
}

export default userLogout;
