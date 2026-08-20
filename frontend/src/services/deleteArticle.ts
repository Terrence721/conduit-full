import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { MessageResponse } from "../types";

interface DeleteArticleParams {
  slug: string;
  headers: { Authorization: string };
}

async function deleteArticle({
  slug,
  headers,
}: DeleteArticleParams): Promise<MessageResponse | undefined> {
  try {
    const { data } = await axios<MessageResponse>({
      headers,
      method: "DELETE",
      url: `/api/articles/${slug}`,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default deleteArticle;
