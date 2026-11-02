import ArticlesListView from "../components/ArticlesListView/ArticlesListView";
import { useFeedContext } from "../hooks/useFeedContext";

function HomeArticles() {
  const { tabName, tagName } = useFeedContext();

  return (
    <ArticlesListView
      emptyText="Articles not available."
      loadingText="Loading articles list..."
      location={tabName}
      tagName={tagName}
    />
  );
}

export default HomeArticles;
