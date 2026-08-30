import { Link } from "react-router-dom";
import Avatar from "../Avatar/Avatar";
import type { Profile } from "../../types";

type CommentAuthorProps = Pick<
  Profile,
  "username" | "bio" | "image" | "following" | "followersCount"
>;

function CommentAuthor({ username, ...profileState }: CommentAuthorProps) {
  const linkProps = {
    className: "comment-author",
    state: profileState,
    to: `/profile/${username}`,
  };

  return (
    <>
      <Link {...linkProps}>
        <Avatar
          alt={username}
          className="comment-author-img"
          src={profileState.image}
        />
      </Link>{" "}
      <Link {...linkProps}>{username}</Link>
    </>
  );
}

export default CommentAuthor;
