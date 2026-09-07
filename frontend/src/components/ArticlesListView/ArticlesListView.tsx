import ArticlesPagination from "../ArticlesPagination/ArticlesPagination";
import ArticlesPreview from "../ArticlesPreview/ArticlesPreview";
import useArticles from "../../hooks/useArticles";
import type { UseArticlesParams } from "../../hooks/useArticles";

interface ArticlesListViewProps extends UseArticlesParams {
  emptyText: string;
  loadingText: string;
}

function ArticlesListView({
  emptyText,
  loadingText,
  location,
  tagName,
  username,
}: ArticlesListViewProps) {
  const { articles, articlesCount, loading, setArticlesData } = useArticles({
    location,
    tagName,
    username,
  });

  return (
    <>
      <ArticlesPreview
        articles={articles}
        emptyText={emptyText}
        loading={loading}
        loadingText={loadingText}
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
  );
}

export default ArticlesListView;
