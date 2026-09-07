import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import getArticles from "../services/getArticles";
import type { ArticleLocation, ArticlesResponse } from "../types";

export interface UseArticlesParams {
  location: ArticleLocation;
  tagName?: string;
  username?: string;
}

const emptyArticlesData: ArticlesResponse = { articles: [], articlesCount: 0 };

function useArticles({ location, tagName, username }: UseArticlesParams) {
  const [data, setArticlesData] = useState<ArticlesResponse | undefined>(
    emptyArticlesData,
  );
  const [loadedKey, setLoadedKey] = useState("");
  const { headers } = useAuth();
  const requestKey = JSON.stringify({
    hasHeaders: !!headers,
    location,
    tagName,
    username,
  });

  useEffect(() => {
    if (!headers && location === "feed") return;

    getArticles({ headers, location, tagName, username })
      .then((result) => setArticlesData(result ?? emptyArticlesData))
      .catch(console.error)
      .finally(() => setLoadedKey(requestKey));
  }, [headers, location, tagName, username, requestKey]);

  const { articles, articlesCount } = data ?? emptyArticlesData;

  return {
    articles,
    articlesCount,
    loading: requestKey !== loadedKey,
    setArticlesData,
  };
}

export default useArticles;
