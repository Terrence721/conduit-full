import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import dateFormatter from "../../helpers/dateFormatter";
import Avatar from "../Avatar/Avatar";
import type { Article, Profile } from "../../types";

type ArticleMetaProps = Pick<Article, "author" | "createdAt"> & {
  children: ReactNode;
};

function ArticleMeta({ author, children, createdAt }: ArticleMetaProps) {
  const { bio, followersCount, following, image, username } = author;
  const profileState: Omit<Profile, "username"> = {
    bio,
    followersCount,
    following,
    image,
  };

  return (
    <div className="article-meta">
      <Link state={profileState} to={`/profile/${username}`}>
        <Avatar alt={username} src={image} />
      </Link>
      <div className="info">
        <Link
          className="author"
          state={profileState}
          to={`/profile/${username}`}
        >
          {username}
        </Link>
        <span className="date">{dateFormatter(createdAt)}</span>
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
