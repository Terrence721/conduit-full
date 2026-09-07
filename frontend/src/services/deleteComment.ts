import apiRequest from "../helpers/apiRequest";
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
  return apiRequest<MessageResponse>({
    headers,
    method: "DELETE",
    url: `/api/articles/${slug}/comments/${commentId}`,
  });
}

export default deleteComment;
