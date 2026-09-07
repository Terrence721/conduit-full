import apiRequest from "../helpers/apiRequest";
import type { Profile, ProfileResponse } from "../types";

interface ToggleFollowParams {
  following: boolean;
  headers: { Authorization: string };
  username: string;
}

async function toggleFollow({
  following,
  headers,
  username,
}: ToggleFollowParams): Promise<Profile | undefined> {
  const data = await apiRequest<ProfileResponse>({
    headers,
    method: following ? "DELETE" : "POST",
    url: `/api/profiles/${username}/follow`,
  });

  return data?.profile;
}

export default toggleFollow;
