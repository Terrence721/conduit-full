import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta/ArticleMeta";
import ArticlesButtons from "../../components/ArticlesButtons/ArticlesButtons";
import ArticleTags from "../../components/ArticleTags/ArticleTags";
import BannerContainer from "../../components/BannerContainer/BannerContainer";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import type { Article as ArticleType } from "../../types";

const emptyArticle: ArticleType = {
  slug: "",
  title: "",
  description: "",
  body: "",
  createdAt: "",
  updatedAt: "",
  tagList: [],
  favorited: false,
  favoritesCount: 0,
  author: {
    username: "",
    bio: null,
    image: null,
    following: false,
    followersCount: 0,
  },
};

function Article() {
  const { state }: { state: ArticleType | null } = useLocation();
  const [article, setArticle] = useState<ArticleType>(state ?? emptyArticle);
  const { title, body, tagList, createdAt, author } = article;
  const { headers, isAuth } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    if (state || !slug) return;

    getArticle({ headers, slug })
      .then((result) => {
        if (!result) return;
        setArticle(result);
      })
      .catch((error: unknown) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [isAuth, slug, headers, state, navigate]);

  return (
    <div className="article-page">
      <BannerContainer>
        <h1>{title}</h1>
        <ArticleMeta author={author} createdAt={createdAt}>
          <ArticlesButtons article={article} setArticle={setArticle} />
        </ArticleMeta>
      </BannerContainer>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            {body && <Markdown options={{ forceBlock: true }}>{body}</Markdown>}
            <ArticleTags tagList={tagList} />
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <ArticleMeta author={author} createdAt={createdAt}>
            <ArticlesButtons article={article} setArticle={setArticle} />
          </ArticleMeta>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default Article;
