import apiRequest from "../helpers/apiRequest";
import type { Article, ArticleResponse } from "../types";

interface GetArticleParams {
  headers?: Record<string, string>;
  slug: string;
}

async function getArticle({
  headers,
  slug,
}: GetArticleParams): Promise<Article | undefined> {
  const data = await apiRequest<ArticleResponse>({
    headers,
    url: `/api/articles/${slug}`,
  });

  return data?.article;
}

export default getArticle;
