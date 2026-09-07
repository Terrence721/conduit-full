import apiRequest from "../helpers/apiRequest";
import type { AuthState, UserResponse } from "../types";

interface UserSignUpParams {
  username: string;
  email: string;
  password: string;
}

async function userSignUp({
  username,
  email,
  password,
}: UserSignUpParams): Promise<AuthState | undefined> {
  const data = await apiRequest<UserResponse>({
    data: { user: { username, email, password } },
    method: "POST",
    url: "/api/users",
  });
  if (!data) return undefined;

  const { user } = data;
  const headers = { Authorization: `Token ${user.token}` };
  const loggedIn: AuthState = { headers, isAuth: true, loggedUser: user };

  localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

  return loggedIn;
}

export default userSignUp;
