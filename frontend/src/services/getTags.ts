import axios from "axios";
import errorHandler from "../helpers/errorHandler";

interface TagsResponse {
  tags: string[];
}

async function getTags(): Promise<string[]> {
  try {
    const { data } = await axios<TagsResponse>({ url: "/api/tags" });

    return data.tags;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }

    return [];
  }
}

export default getTags;
