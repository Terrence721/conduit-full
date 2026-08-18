import axios from "axios";
import errorHandler from "../helpers/errorHandler";

interface DeleteArticleParams {
  slug: string;
  headers: { Authorization: string };
}

interface DeleteArticleResponse {
  message: { body: string[] };
}

async function deleteArticle({
  slug,
  headers,
}: DeleteArticleParams): Promise<DeleteArticleResponse | undefined> {
  try {
    const { data } = await axios<DeleteArticleResponse>({
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
