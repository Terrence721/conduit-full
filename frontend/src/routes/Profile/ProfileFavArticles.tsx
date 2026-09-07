import { useParams } from "react-router-dom";
import ArticlesListView from "../../components/ArticlesListView/ArticlesListView";

function ProfileFavArticles() {
  const { username } = useParams();

  return (
    <ArticlesListView
      emptyText={`${username} doesn't have favorites.`}
      loadingText={`Loading ${username} favorites articles...`}
      location="favorites"
      username={username}
    />
  );
}

export default ProfileFavArticles;
