import type { Dispatch, SetStateAction } from "react";
import { useAuth } from "../../context/AuthContext";
import ArticleAuthorButtons from "../ArticleAuthorButtons/ArticleAuthorButtons";
import FavButton from "../FavButton/FavButton";
import FollowButton from "../FollowButton/FollowButton";
import type { Article, Profile } from "../../types";

interface ArticlesButtonsProps {
  article: Article;
  setArticle: Dispatch<SetStateAction<Article>>;
}

function ArticlesButtons({ article, setArticle }: ArticlesButtonsProps) {
  const { author } = article;
  const { loggedUser } = useAuth();

  const followHandler = (updated: Profile | undefined) => {
    if (!updated) return;
    setArticle((prev) => ({ ...prev, author: updated }));
  };

  const handleFav = (updated: Article | undefined) => {
    if (!updated) return;
    setArticle((prev) => ({
      ...prev,
      favorited: updated.favorited,
      favoritesCount: updated.favoritesCount,
    }));
  };

  return loggedUser.username === author.username ? (
    <ArticleAuthorButtons {...article} />
  ) : (
    <>
      <FollowButton {...author} handler={followHandler} />
      <FavButton {...article} handler={handleFav} text />
    </>
  );
}

export default ArticlesButtons;
