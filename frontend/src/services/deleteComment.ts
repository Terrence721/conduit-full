import axios from "axios";
import errorHandler from "../helpers/errorHandler";

interface DeleteCommentParams {
  commentId: number;
  headers: { Authorization: string };
  slug: string;
}

interface DeleteCommentResponse {
  message: { body: string[] };
}

async function deleteComment({
  commentId,
  headers,
  slug,
}: DeleteCommentParams): Promise<DeleteCommentResponse | undefined> {
  try {
    const { data } = await axios<DeleteCommentResponse>({
      headers,
      method: "DELETE",
      url: `/api/articles/${slug}/comments/${commentId}`,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default deleteComment;
