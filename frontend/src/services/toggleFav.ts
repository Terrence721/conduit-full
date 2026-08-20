import axios from "axios";
import errorHandler from "../helpers/errorHandler";
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
  try {
    const { data } = await axios<ArticleResponse>({
      headers,
      method: favorited ? "DELETE" : "POST",
      url: `/api/articles/${slug}/favorite`,
    });

    return data.article;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default toggleFav;
