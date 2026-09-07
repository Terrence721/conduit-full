import apiRequest from "../helpers/apiRequest";
import type { MessageResponse } from "../types";

interface DeleteArticleParams {
  slug: string;
  headers: { Authorization: string };
}

async function deleteArticle({
  slug,
  headers,
}: DeleteArticleParams): Promise<MessageResponse | undefined> {
  return apiRequest<MessageResponse>({
    headers,
    method: "DELETE",
    url: `/api/articles/${slug}`,
  });
}

export default deleteArticle;
