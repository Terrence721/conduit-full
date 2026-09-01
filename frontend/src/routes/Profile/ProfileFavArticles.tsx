import { useParams } from "react-router-dom";
import ArticlesPagination from "../../components/ArticlesPagination/ArticlesPagination";
import ArticlesPreview from "../../components/ArticlesPreview/ArticlesPreview";
import useArticles from "../../hooks/useArticles";

function ProfileFavArticles() {
  const { username } = useParams();

  const { articles, articlesCount, loading, setArticlesData } = useArticles({
    location: "favorites",
    username,
  });

  return loading ? (
    <div className="article-preview">
      <em>Loading {username} favorites articles...</em>
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
        location="favorites"
        updateArticles={setArticlesData}
        username={username}
      />
    </>
  ) : (
    <div className="article-preview">
      {username} doesn&apos;t have favorites.
    </div>
  );
}

export default ProfileFavArticles;
