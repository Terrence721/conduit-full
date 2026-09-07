import apiRequest from "../helpers/apiRequest";
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
  const data = await apiRequest<CommentsResponse>({
    headers,
    url: `/api/articles/${slug}/comments`,
  });

  return data?.comments ?? [];
}

export default getComments;
