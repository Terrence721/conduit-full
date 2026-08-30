import { useState, type ChangeEventHandler, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import requireAuth from "../../helpers/requireAuth";
import postComment from "../../services/postComment";
import Avatar from "../Avatar/Avatar";
import type { Comment } from "../../types";

interface CommentEditorProps {
  updateComments: (comment: Comment | undefined) => void;
}

function CommentEditor({ updateComments }: CommentEditorProps) {
  const [{ body }, setForm] = useState({ body: "" });
  const auth = useAuth();
  const { slug } = useParams();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (body.trim() === "") return;

    const authed = requireAuth(auth);
    if (!authed || !slug) return;

    postComment({ body, headers: authed.headers, slug })
      .then((comment) => {
        if (!comment) return;
        updateComments(comment);
        setForm({ body: "" });
      })
      .catch(console.error);
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setForm({ body: e.target.value });
  };

  return auth.isAuth ? (
    <form className="card comment-form" onSubmit={handleSubmit}>
      <div className="card-block">
        <textarea
          className="form-control"
          onChange={handleChange}
          placeholder="Write a comment..."
          rows={3}
          value={body}
        ></textarea>
      </div>

      <div className="card-footer">
        <Avatar
          alt={auth.loggedUser.username}
          className="comment-author-img"
          src={auth.loggedUser.image}
        />
        <button className="btn btn-sm btn-primary">Post Comment</button>
      </div>
    </form>
  ) : (
    <span>
      <Link to="/login">Sign in</Link> or <Link to="/register">Sign up</Link> to
      add comments on this article.
    </span>
  );
}

export default CommentEditor;
