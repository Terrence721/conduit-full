import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { Article } from "../types";

interface GetArticleParams {
  headers?: Record<string, string>;
  slug: string;
}

interface ArticleResponse {
  article: Article;
}

async function getArticle({
  headers,
  slug,
}: GetArticleParams): Promise<Article | undefined> {
  try {
    const { data } = await axios<ArticleResponse>({
      headers,
      url: `/api/articles/${slug}`,
    });

    return data.article;
  } catch (error) {
    errorHandler(error);
  }
}

export default getArticle;
