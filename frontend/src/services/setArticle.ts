import apiRequest from "../helpers/apiRequest";
import type { ArticleResponse } from "../types";

interface SetArticleParams {
  body: string;
  description: string;
  headers: { Authorization: string };
  slug?: string;
  tagList?: string[];
  title: string;
}

async function setArticle({
  body,
  description,
  headers,
  slug,
  tagList,
  title,
}: SetArticleParams): Promise<string | undefined> {
  const data = await apiRequest<ArticleResponse>({
    data: { article: { title, description, body, tagList } },
    headers,
    method: slug ? "PUT" : "POST",
    url: slug ? `/api/articles/${slug}` : "/api/articles",
  });

  return data?.article.slug;
}

export default setArticle;
