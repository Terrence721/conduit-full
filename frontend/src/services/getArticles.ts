import apiRequest from "../helpers/apiRequest";
import type { ArticleLocation, ArticlesResponse } from "../types";

interface GetArticlesParams {
  headers?: Record<string, string>;
  limit?: number;
  location: ArticleLocation;
  page?: number;
  tagName?: string;
  username?: string;
}

async function getArticles({
  headers,
  limit = 3,
  location,
  page = 0,
  tagName,
  username,
}: GetArticlesParams): Promise<ArticlesResponse | undefined> {
  const url: Record<ArticleLocation, string> = {
    favorites: `/api/articles?favorited=${username}&&limit=${limit}&&offset=${page}`,
    feed: `/api/articles/feed?limit=${limit}&&offset=${page}`,
    global: `/api/articles?limit=${limit}&&offset=${page}`,
    profile: `/api/articles?author=${username}&&limit=${limit}&&offset=${page}`,
    tag: `/api/articles?tag=${tagName}&&limit=${limit}&&offset=${page}`,
  };

  return apiRequest<ArticlesResponse>({ url: url[location], headers });
}

export default getArticles;
