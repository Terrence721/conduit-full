import apiRequest from "../helpers/apiRequest";
import type { Article, ArticleResponse } from "../types";

interface ToggleFavParams {
  favorited: boolean;
  headers: { Authorization: string };
  slug: string;
}

async function toggleFav({
  favorited,
  headers,
  slug,
}: ToggleFavParams): Promise<Article | undefined> {
  const data = await apiRequest<ArticleResponse>({
    headers,
    method: favorited ? "DELETE" : "POST",
    url: `/api/articles/${slug}/favorite`,
  });

  return data?.article;
}

export default toggleFav;
