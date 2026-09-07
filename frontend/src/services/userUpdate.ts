import apiRequest from "../helpers/apiRequest";
import type { AuthState, UserResponse } from "../types";

interface UserUpdateParams {
  headers: { Authorization: string };
  bio?: string;
  email?: string;
  image?: string;
  password?: string;
  username?: string;
}

async function userUpdate({
  headers,
  bio,
  email,
  image,
  password,
  username,
}: UserUpdateParams): Promise<AuthState | undefined> {
  const data = await apiRequest<UserResponse>({
    data: { user: { bio, email, image, password, username } },
    headers,
    method: "PUT",
    url: "/api/user",
  });
  if (!data) return undefined;

  const { user } = data;
  const loggedIn: AuthState = { headers, isAuth: true, loggedUser: user };

  localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

  return loggedIn;
}

export default userUpdate;
