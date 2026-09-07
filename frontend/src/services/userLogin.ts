import apiRequest from "../helpers/apiRequest";
import type { AuthState, UserResponse } from "../types";

interface UserLoginParams {
  email: string;
  password: string;
}

async function userLogin({
  email,
  password,
}: UserLoginParams): Promise<AuthState | undefined> {
  const data = await apiRequest<UserResponse>({
    data: { user: { email, password } },
    method: "POST",
    url: "/api/users/login",
  });
  if (!data) return undefined;

  const { user } = data;
  const headers = { Authorization: `Token ${user.token}` };
  const loggedIn: AuthState = { headers, isAuth: true, loggedUser: user };

  localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

  return loggedIn;
}

export default userLogin;
