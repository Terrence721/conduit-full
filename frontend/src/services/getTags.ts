import apiRequest from "../helpers/apiRequest";

interface TagsResponse {
  tags: string[];
}

async function getTags(): Promise<string[]> {
  const data = await apiRequest<TagsResponse>({ url: "/api/tags" });

  return data?.tags ?? [];
}

export default getTags;
