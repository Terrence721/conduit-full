import axios from "axios";
import errorHandler from "../helpers/errorHandler";
import type { MessageResponse } from "../types";

interface DeleteCommentParams {
  commentId: number;
  headers: { Authorization: string };
  slug: string;
}

async function deleteComment({
  commentId,
  headers,
  slug,
}: DeleteCommentParams): Promise<MessageResponse | undefined> {
  try {
    const { data } = await axios<MessageResponse>({
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
