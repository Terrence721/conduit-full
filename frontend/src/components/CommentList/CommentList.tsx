import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dateFormatter from "../../helpers/dateFormatter";
import requireAuth from "../../helpers/requireAuth";
import deleteComment from "../../services/deleteComment";
import getComments from "../../services/getComments";
import CommentAuthor from "../CommentAuthor/CommentAuthor";
import type { Comment, MessageResponse } from "../../types";

interface CommentListProps {
  triggerUpdate: unknown;
  updateComments: (result: MessageResponse) => void;
}

function CommentList({ triggerUpdate, updateComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const auth = useAuth();
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;

    getComments({ headers: auth.headers, slug })
      .then(setComments)
      .catch(console.error);
  }, [slug, auth.headers, triggerUpdate]);

  const handleClick = (commentId: number) => {
    const authed = requireAuth(auth);
    if (!authed || !slug) return;

    if (!window.confirm("Want to delete the comment?")) return;

    deleteComment({ commentId, headers: authed.headers, slug })
      .then((result) => {
        if (!result) return;
        updateComments(result);
      })
      .catch(console.error);
  };

  return comments.length > 0 ? (
    comments.map(({ author, body, createdAt, id }) => (
      <div className="card" key={id}>
        <div className="card-block">
          <p className="card-text">{body}</p>
        </div>
        <div className="card-footer">
          <CommentAuthor {...author} />
          <span className="date-posted">{dateFormatter(createdAt)}</span>
          {auth.isAuth && auth.loggedUser.username === author.username && (
            <button
              className="btn btn-sm btn-outline-secondary pull-xs-right"
              onClick={() => handleClick(id)}
            >
              <i className="ion-trash-a"></i>
            </button>
          )}
        </div>
      </div>
    ))
  ) : (
    <div>There are no comments yet...</div>
  );
}

export default CommentList;
