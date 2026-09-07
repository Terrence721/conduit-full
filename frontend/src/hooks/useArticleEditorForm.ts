import {
  useEffect,
  useState,
  type ChangeEventHandler,
  type SubmitEvent,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import fieldHandler from "../helpers/fieldHandler";
import requireAuth from "../helpers/requireAuth";
import getArticle from "../services/getArticle";
import setArticle from "../services/setArticle";
import useRequireAuthRedirect from "./useRequireAuthRedirect";
import type { Article } from "../types";

type ArticleFormState = Pick<
  Article,
  "body" | "description" | "tagList" | "title"
>;

const emptyForm: ArticleFormState = {
  title: "",
  description: "",
  body: "",
  tagList: [],
};

function useArticleEditorForm() {
  const { state }: { state: ArticleFormState | null } = useLocation();
  const initialForm = state ?? emptyForm;
  const [form, setForm] = useState<ArticleFormState>(initialForm);
  const [tagsInput, setTagsInput] = useState(() =>
    initialForm.tagList.join(" "),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const auth = useRequireAuthRedirect();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    if (!auth.isAuth) return;
    if (state || !slug) return;

    getArticle({ headers: auth.headers, slug })
      .then((article) => {
        if (!article) return;
        if (article.author.username !== auth.loggedUser.username) {
          navigate("/", { replace: true, state: null });
          return;
        }

        setForm(article);
        setTagsInput(article.tagList.join(" "));
      })
      .catch(console.error);

    return () => setForm(emptyForm);
  }, [
    auth.isAuth,
    auth.headers,
    auth.loggedUser.username,
    navigate,
    slug,
    state,
  ]);

  const handleField = fieldHandler(setForm);
  const titleHandler = handleField("title");
  const descriptionHandler = handleField("description");
  const bodyHandler = handleField("body");

  const tagsInputHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTagsInput(e.target.value);
  };

  const formSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const authed = requireAuth(auth);
    if (!authed) return;

    setArticle({
      body: form.body,
      description: form.description,
      headers: authed.headers,
      slug,
      tagList: tagsInput.split(/,| /).filter(Boolean),
      title: form.title,
    })
      .then((newSlug) => {
        if (!newSlug) return;
        navigate(`/article/${newSlug}`);
      })
      .catch(setErrorMessage);
  };

  return {
    bodyHandler,
    descriptionHandler,
    errorMessage,
    form,
    formSubmit,
    slug,
    tagsInput,
    tagsInputHandler,
    titleHandler,
  };
}

export default useArticleEditorForm;
