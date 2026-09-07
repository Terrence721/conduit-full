import apiRequest from "../helpers/apiRequest";
import type { User, UserResponse } from "../types";

interface GetUserParams {
  headers?: Record<string, string>;
}

async function getUser({ headers }: GetUserParams): Promise<User | undefined> {
  const data = await apiRequest<UserResponse>({ headers, url: "/api/user" });

  return data?.user;
}

export default getUser;
