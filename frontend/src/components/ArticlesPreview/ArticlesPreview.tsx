import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import ArticleMeta from "../ArticleMeta/ArticleMeta";
import ArticleTags from "../ArticleTags/ArticleTags";
import FavButton from "../FavButton/FavButton";
import type { Article, ArticlesResponse } from "../../types";

interface ArticlesPreviewProps {
  articles: Article[] | undefined;
  loading: boolean;
  updateArticles: Dispatch<SetStateAction<ArticlesResponse | undefined>>;
}

function ArticlesPreview({
  articles,
  loading,
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

  if (!articles || articles.length === 0) {
    return (
      <div className="article-preview">
        {loading ? "Loading article..." : "No articles available."}
      </div>
    );
  }

  return articles.map((article) => (
    <div className="article-preview" key={article.slug}>
      <ArticleMeta author={article.author} createdAt={article.createdAt}>
        <FavButton
          favorited={article.favorited}
          favoritesCount={article.favoritesCount}
          handler={handleFav}
          right
          slug={article.slug}
        />
      </ArticleMeta>
      <Link
        className="preview-link"
        state={article}
        to={`/article/${article.slug}`}
      >
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ArticleTags tagList={article.tagList} />
      </Link>
    </div>
  ));
}

export default ArticlesPreview;
