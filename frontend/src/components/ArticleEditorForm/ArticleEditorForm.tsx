import useArticleEditorForm from "../../hooks/useArticleEditorForm";
import FormFieldset from "../FormFieldset/FormFieldset";

function ArticleEditorForm() {
  const {
    bodyHandler,
    descriptionHandler,
    errorMessage,
    form,
    formSubmit,
    slug,
    tagsInput,
    tagsInputHandler,
    titleHandler,
  } = useArticleEditorForm();

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
