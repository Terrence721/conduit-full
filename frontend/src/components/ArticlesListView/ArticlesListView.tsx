import type { ReactNode } from "react";
import ArticlesPagination from "../ArticlesPagination/ArticlesPagination";
import ArticlesPreview from "../ArticlesPreview/ArticlesPreview";
import type { FeedTabName } from "../../context/FeedContext";
import useArticles from "../../hooks/useArticles";
import type { ArticleLocation } from "../../types";

interface ArticlesListViewProps {
  emptyText: ReactNode;
  loadingText: ReactNode;
  location: ArticleLocation;
  tabName?: FeedTabName;
  tagName?: string;
  username?: string;
}

function ArticlesListView({
  emptyText,
  loadingText,
  location,
  tabName,
  tagName,
  username,
}: ArticlesListViewProps) {
  const { articles, articlesCount, loading, setArticlesData } = useArticles({
    location,
    tabName,
    tagName,
    username,
  });

  return loading ? (
    <div className="article-preview">
      <em>{loadingText}</em>
    </div>
  ) : articles.length > 0 ? (
    <>
      <ArticlesPreview
        articles={articles}
        loading={loading}
        updateArticles={setArticlesData}
      />

      <ArticlesPagination
        articlesCount={articlesCount}
        location={location}
        tagName={tagName}
        updateArticles={setArticlesData}
        username={username}
      />
    </>
  ) : (
    <div className="article-preview">{emptyText}</div>
  );
}

export default ArticlesListView;
