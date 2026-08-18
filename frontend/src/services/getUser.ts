import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { User } from "../types";

interface GetUserParams {
  headers?: Record<string, string>;
}

interface UserResponse {
  user: User;
}

async function getUser({ headers }: GetUserParams): Promise<User | undefined> {
  try {
    const { data } = await axios<UserResponse>({
      headers,
      url: "/api/user",
    });

    return data.user;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default getUser;
