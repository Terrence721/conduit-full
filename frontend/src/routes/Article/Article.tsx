import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import requireAuth from "../../helpers/requireAuth";
import toggleFav from "../../services/toggleFav";
import getArticle from "../../services/getArticle";
import dateFormatter from "../../helpers/dateFormatter";
import type { Article as ArticleType } from "../../types";

const emptyArticle: ArticleType = {
  author: {
    bio: null,
    followersCount: 0,
    following: false,
    image: null,
    username: "",
  },
  body: "",
  createdAt: "",
  description: "",
  favorited: false,
  favoritesCount: 0,
  slug: "",
  tagList: [],
  title: "",
  updatedAt: "",
};

function initials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function role(bio: string | null): string {
  return bio?.trim() ? bio.trim() : "Contributor";
}

function Article() {
  const auth = useAuth();
  const { headers } = auth;
  const navigate = useNavigate();
  const { slug } = useParams();
  const [article, setArticle] = useState<ArticleType>(emptyArticle);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getArticle({ headers, slug })
      .then((result) => {
        if (!result) return;
        setArticle(result);
      })
      .catch(() => navigate("/not-found", { replace: true }))
      .finally(() => setLoading(false));
  }, [headers, slug, navigate]);

  const handleFavorite = () => {
    const authed = requireAuth(auth);
    if (!authed || !slug) return;

    toggleFav({ favorited: article.favorited, headers: authed.headers, slug })
      .then((updated) => {
        if (!updated) return;
        setArticle((prev) => ({
          ...prev,
          favorited: updated.favorited,
          favoritesCount: updated.favoritesCount,
        }));
      })
      .catch(console.error);
  };

  if (loading || !article.slug) {
    return (
      <main className="reader">
        <div className="empty-state">
          <p>Loading article…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="reader">
      <div className="reader-toolbar">
        <Link to="/">
          <button type="button">Back to stories</button>
        </Link>
        <button
          className={article.favorited ? "reader-save saved" : "reader-save"}
          type="button"
          onClick={handleFavorite}
        >
          {article.favorited ? "Saved" : "Save story"}
        </button>
      </div>

      <article className="reader-article">
        <header className="reader-header">
          <div className="reader-tags">
            {article.tagList.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h1>{article.title}</h1>
          <p className="reader-deck">{article.description}</p>
          <div className="reader-byline">
            <span className="author-avatar" style={{ background: "#d8f078" }}>
              {initials(article.author.username)}
            </span>
            <p>
              <strong>{article.author.username}</strong>
              <span>
                {role(article.author.bio)} · {dateFormatter(article.createdAt)}
              </span>
            </p>
          </div>
        </header>

        <div className="reader-visual" style={{ background: "#d8f078" }}>
          <span>{article.slug.slice(0, 2).toUpperCase()}</span>
          <i />
          <b aria-hidden="true">✦</b>
        </div>

        <div className="reader-layout">
          <aside className="reader-aside">
            <span>Story</span>
            <p>{article.favoritesCount} appreciations</p>
          </aside>
          <div className="reader-body">
            <Markdown options={{ forceBlock: true }}>{article.body}</Markdown>
          </div>
        </div>

        <footer className="reader-author-card">
          <span className="author-avatar" style={{ background: "#d8f078" }}>
            {initials(article.author.username)}
          </span>
          <div>
            <p>Written by</p>
            <h3>{article.author.username}</h3>
            <span>
              {role(article.author.bio)}. Writing about{" "}
              {article.tagList.join(" and ").toLowerCase()}.
            </span>
          </div>
        </footer>
      </article>

      <Outlet />
    </main>
  );
}

export default Article;
