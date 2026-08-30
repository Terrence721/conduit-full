import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { Comment } from "../types";

interface GetCommentsParams {
  headers?: Record<string, string>;
  slug: string;
}

interface CommentsResponse {
  comments: Comment[];
}

async function getComments({
  headers,
  slug,
}: GetCommentsParams): Promise<Comment[]> {
  try {
    const { data } = await axios<CommentsResponse>({
      headers,
      url: `/api/articles/${slug}/comments`,
    });

    return data.comments;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }

    return [];
  }
}

export default getComments;
