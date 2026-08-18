import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { Article } from "../types";

type ArticleLocation = "favorites" | "feed" | "global" | "profile" | "tag";

interface GetArticlesParams {
  headers?: Record<string, string>;
  limit?: number;
  location: ArticleLocation;
  page?: number;
  tagName?: string;
  username?: string;
}

interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

async function getArticles({
  headers,
  limit = 3,
  location,
  page = 0,
  tagName,
  username,
}: GetArticlesParams): Promise<ArticlesResponse | undefined> {
  try {
    const url: Record<ArticleLocation, string> = {
      favorites: `/api/articles?favorited=${username}&&limit=${limit}&&offset=${page}`,
      feed: `/api/articles/feed?limit=${limit}&&offset=${page}`,
      global: `/api/articles?limit=${limit}&&offset=${page}`,
      profile: `/api/articles?author=${username}&&limit=${limit}&&offset=${page}`,
      tag: `/api/articles?tag=${tagName}&&limit=${limit}&&offset=${page}`,
    };

    const { data } = await axios<ArticlesResponse>({
      url: url[location],
      headers,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default getArticles;
