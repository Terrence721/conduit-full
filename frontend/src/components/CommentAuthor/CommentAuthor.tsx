import { Link } from "react-router-dom";
import Avatar from "../Avatar/Avatar";
import type { Profile } from "../../types";

function CommentAuthor({ username, ...profileState }: Profile) {
  const profileUrl = `/profile/${username}`;

  return (
    <>
      <Link className="comment-author" state={profileState} to={profileUrl}>
        <Avatar
          alt={username}
          className="comment-author-img"
          src={profileState.image}
        />
      </Link>{" "}
      <Link className="comment-author" state={profileState} to={profileUrl}>
        {username}
      </Link>
    </>
  );
}

export default CommentAuthor;
