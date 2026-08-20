import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { Profile, ProfileResponse } from "../types";

interface GetProfileParams {
  headers?: Record<string, string>;
  username: string;
}

async function getProfile({
  headers,
  username,
}: GetProfileParams): Promise<Profile | undefined> {
  try {
    const { data } = await axios<ProfileResponse>({
      headers,
      url: `/api/profiles/${username}`,
    });

    return data.profile;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default getProfile;
