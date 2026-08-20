import axios from "axios";
import errorHandler from "../helpers/errorHandler";
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
  try {
    const { data } = await axios<CommentResponse>({
      data: { comment: { body } },
      headers,
      method: "POST",
      url: `/api/articles/${slug}/comments`,
    });

    return data.comment;
  } catch (error) {
    if (axios.isAxiosError<{ errors: { body: string[] } }>(error)) {
      errorHandler(error);
    }
  }
}

export default postComment;
