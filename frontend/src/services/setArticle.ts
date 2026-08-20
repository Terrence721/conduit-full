import axios from "axios";
import errorHandler from "../helpers/errorHandler";
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
  try {
    const { data } = await axios<ArticleResponse>({
      data: { article: { title, description, body, tagList } },
      headers,
      method: slug ? "PUT" : "POST",
      url: slug ? `/api/articles/${slug}` : "/api/articles",
    });

    return data.article.slug;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default setArticle;
