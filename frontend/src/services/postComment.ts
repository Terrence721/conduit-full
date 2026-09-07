import apiRequest from "../helpers/apiRequest";
import type { Comment } from "../types";

interface PostCommentParams {
  body: string;
  headers: { Authorization: string };
  slug: string;
}

interface CommentResponse {
  comment: Comment;
}

async function postComment({
  body,
  headers,
  slug,
}: PostCommentParams): Promise<Comment | undefined> {
  const data = await apiRequest<CommentResponse>({
    data: { comment: { body } },
    headers,
    method: "POST",
    url: `/api/articles/${slug}/comments`,
  });

  return data?.comment;
}

export default postComment;
