import { useParams } from "react-router-dom";
import ArticlesListView from "../../components/ArticlesListView/ArticlesListView";

function ProfileArticles() {
  const { username } = useParams();

  return (
    <ArticlesListView
      emptyText={`${username} doesn't have articles.`}
      loadingText={`Loading ${username} articles...`}
      location="profile"
      username={username}
    />
  );
}

export default ProfileArticles;
