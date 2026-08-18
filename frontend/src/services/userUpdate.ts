import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { AuthState, User } from "../types";

interface UserUpdateParams {
  headers: { Authorization: string };
  bio?: string;
  email?: string;
  image?: string;
  password?: string;
  username?: string;
}

interface UserResponse {
  user: User;
}

async function userUpdate({
  headers,
  bio,
  email,
  image,
  password,
  username,
}: UserUpdateParams): Promise<AuthState | undefined> {
  try {
    const { data } = await axios<UserResponse>({
      data: { user: { bio, email, image, password, username } },
      headers,
      method: "PUT",
      url: "/api/user",
    });

    const { user } = data;

    const loggedIn: AuthState = { headers, isAuth: true, loggedUser: user };

    localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

    return loggedIn;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default userUpdate;
