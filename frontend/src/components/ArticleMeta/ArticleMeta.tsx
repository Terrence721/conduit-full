import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import dateFormatter from "../../helpers/dateFormatter";
import Avatar from "../Avatar/Avatar";
import type { Article } from "../../types";

type ArticleMetaProps = Pick<Article, "author" | "createdAt"> & {
  children: ReactNode;
};

function ArticleMeta({ author, children, createdAt }: ArticleMetaProps) {
  const { username, ...profileState } = author;
  const profileUrl = `/profile/${username}`;

  return (
    <div className="article-meta">
      <Link state={profileState} to={profileUrl}>
        <Avatar alt={username} src={profileState.image} />
      </Link>
      <div className="info">
        <Link className="author" state={profileState} to={profileUrl}>
          {username}
        </Link>
        <span className="date">{dateFormatter(createdAt)}</span>
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
