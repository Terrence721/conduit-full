import {
  useEffect,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type SubmitEvent,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import requireAuth from "../../helpers/requireAuth";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset/FormFieldset";
import type { Article } from "../../types";

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

function ArticleEditorForm() {
  const { state }: { state: ArticleFormState | null } = useLocation();
  const initialForm = state ?? emptyForm;
  const [form, setForm] = useState<ArticleFormState>(initialForm);
  const [tagsInput, setTagsInput] = useState(() =>
    initialForm.tagList.join(" "),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!auth.isAuth) {
      redirect();
      return;
    }

    if (state || !slug) return;

    getArticle({ headers: auth.headers, slug })
      .then((article) => {
        if (!article) return;
        if (article.author.username !== auth.loggedUser.username) {
          redirect();
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

  function fieldHandler<K extends "title" | "description" | "body">(field: K) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
  }

  const titleHandler = fieldHandler("title");
  const descriptionHandler = fieldHandler("description");
  const bodyHandler = fieldHandler("body");

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

  return (
    <form onSubmit={formSubmit}>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        <FormFieldset
          placeholder="Article Title"
          name="title"
          required
          value={form.title}
          handler={titleHandler}
        ></FormFieldset>

        <FormFieldset
          normal
          placeholder="What's this article about?"
          name="description"
          required
          value={form.description}
          handler={descriptionHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows={8}
            placeholder="Write your article (in markdown)"
            name="body"
            required
            value={form.body}
            onChange={bodyHandler}
          ></textarea>
        </fieldset>

        <FormFieldset
          normal
          placeholder="Enter tags"
          name="tags"
          value={tagsInput}
          handler={tagsInputHandler}
        >
          <div className="tag-list"></div>
        </FormFieldset>

        <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
          {slug ? "Update Article" : "Publish Article"}
        </button>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
