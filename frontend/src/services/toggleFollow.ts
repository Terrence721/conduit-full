import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { Profile } from "../types";

interface ToggleFollowParams {
  following: boolean;
  headers: { Authorization: string };
  username: string;
}

interface ProfileResponse {
  profile: Profile;
}

async function toggleFollow({
  following,
  headers,
  username,
}: ToggleFollowParams): Promise<Profile | undefined> {
  try {
    const { data } = await axios<ProfileResponse>({
      headers,
      method: following ? "DELETE" : "POST",
      url: `/api/profiles/${username}/follow`,
    });

    return data.profile;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default toggleFollow;
