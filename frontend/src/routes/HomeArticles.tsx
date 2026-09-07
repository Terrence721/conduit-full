import ArticlesListView from "../components/ArticlesListView/ArticlesListView";
import { useFeedContext } from "../context/FeedContext";

function HomeArticles() {
  const { tabName, tagName } = useFeedContext();

  return (
    <ArticlesListView
      emptyText="Articles not available."
      loadingText="Loading articles list..."
      location={tabName}
      tabName={tabName}
      tagName={tagName}
    />
  );
}

export default HomeArticles;
