import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import requireAuth from "../../helpers/requireAuth";
import deleteArticle from "../../services/deleteArticle";
import type { Article } from "../../types";

type ArticleAuthorButtonsProps = Pick<
  Article,
  "body" | "description" | "slug" | "tagList" | "title"
>;

function ArticleAuthorButtons({
  body,
  description,
  slug,
  tagList,
  title,
}: ArticleAuthorButtonsProps) {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    const authed = requireAuth(auth);
    if (!authed) return;

    const confirmation = window.confirm("Want to delete the article?");
    if (!confirmation) return;

    deleteArticle({ headers: authed.headers, slug })
      .then(() => navigate("/"))
      .catch(console.error);
  };

  return (
    <>
      <button
        className="btn btn-sm"
        style={{ color: "#d00" }}
        onClick={handleClick}
      >
        <i className="ion-trash-a"></i> Delete Article
      </button>{" "}
      <button className="btn btn-sm" style={{ color: "#777" }}>
        <Link
          className="nav-link"
          state={{ body, description, tagList, title }}
          to={`/editor/${slug}`}
        >
          <i className="ion-edit"></i> Edit Article
        </Link>
      </button>{" "}
    </>
  );
}

export default ArticleAuthorButtons;
