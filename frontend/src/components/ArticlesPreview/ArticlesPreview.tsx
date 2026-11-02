import { Link } from "react-router-dom";
import dateFormatter from "../../helpers/dateFormatter";
import FavButton from "../FavButton/FavButton";
import type { Article, ArticlesResponse } from "../../types";
import type { Dispatch, SetStateAction } from "react";

interface ArticlesPreviewProps {
  articles: Article[] | undefined;
  emptyText: string;
  loading: boolean;
  loadingText: string;
  updateArticles: Dispatch<SetStateAction<ArticlesResponse | undefined>>;
}

const colors = [
  "#d8f078",
  "#b9d9ff",
  "#ffc9b8",
  "#d8c7ff",
  "#f6d58d",
  "#a9e2cf",
];

function initials(username: string): string {
  return (
    username
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || username.slice(0, 2).toUpperCase()
  );
}

function role(bio: string | null): string {
  return bio?.trim() ? bio.trim() : "Contributor";
}

function readTime(body: string | undefined): string {
  const words = body?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return `${Math.max(3, Math.ceil(words / 220))} min read`;
}

function ArticlesPreview({
  articles,
  emptyText,
  loading,
  loadingText,
  updateArticles,
}: ArticlesPreviewProps) {
  const handleFav = (updated: Article | undefined) => {
    if (!updated) return;

    updateArticles(
      (prev) =>
        prev && {
          ...prev,
          articles: prev.articles.map((item) =>
            item.slug === updated.slug ? { ...item, ...updated } : item,
          ),
        },
    );
  };

  if (loading) {
    return (
      <div className="article-preview">
        <em>{loadingText}</em>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return <div className="article-preview">{emptyText}</div>;
  }

  return (
    <>
      {articles.map((article, index) => (
        <article className="article-card" key={article.slug}>
          <div className="article-main">
            <div className="article-author">
              <span
                className="author-avatar"
                style={{ background: colors[index % colors.length] }}
              >
                {initials(article.author.username)}
              </span>
              <p>
                <strong>{article.author.username}</strong>
                <span>
                  {role(article.author.bio)} ·{" "}
                  {dateFormatter(article.createdAt)}
                </span>
              </p>
            </div>
            <Link
              className="article-title-link"
              to={`/article/${article.slug}`}
            >
              <h3>{article.title}</h3>
            </Link>
            <p className="article-description">{article.description}</p>
            <div className="article-footer">
              {article.tagList.length > 0 ? (
                <div>
                  {article.tagList.map((tag) => (
                    <button type="button" key={tag}>
                      {tag}
                    </button>
                  ))}
                  <span>{readTime(article.body)}</span>
                </div>
              ) : (
                <div>
                  <span>{readTime(article.body)}</span>
                </div>
              )}
              <div className="article-stats">
                <FavButton
                  favorited={article.favorited}
                  favoritesCount={article.favoritesCount}
                  handler={handleFav}
                  slug={article.slug}
                />
              </div>
            </div>
          </div>
          <div
            className="article-art"
            style={{ background: colors[index % colors.length] }}
            aria-hidden="true"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <i />
          </div>
        </article>
      ))}
    </>
  );
}

export default ArticlesPreview;
