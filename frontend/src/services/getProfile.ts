import apiRequest from "../helpers/apiRequest";
import type { Profile, ProfileResponse } from "../types";

interface GetProfileParams {
  headers?: Record<string, string>;
  username: string;
}

async function getProfile({
  headers,
  username,
}: GetProfileParams): Promise<Profile | undefined> {
  const data = await apiRequest<ProfileResponse>({
    headers,
    url: `/api/profiles/${username}`,
  });

  return data?.profile;
}

export default getProfile;
