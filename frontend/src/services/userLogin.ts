import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { AuthState, User } from "../types";

interface UserLoginParams {
  email: string;
  password: string;
}

interface UserResponse {
  user: User;
}

async function userLogin({
  email,
  password,
}: UserLoginParams): Promise<AuthState | undefined> {
  try {
    const { data } = await axios<UserResponse>({
      data: { user: { email, password } },
      method: "POST",
      url: "/api/users/login",
    });

    const { user } = data;
    const headers = { Authorization: `Token ${user.token}` };

    const loggedIn: AuthState = { headers, isAuth: true, loggedUser: user };

    localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

    return loggedIn;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default userLogin;
