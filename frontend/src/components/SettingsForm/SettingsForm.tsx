import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import fieldHandler from "../../helpers/fieldHandler";
import requireAuth from "../../helpers/requireAuth";
import userUpdate from "../../services/userUpdate";
import FormFieldset from "../FormFieldset/FormFieldset";
import type { User } from "../../types";

interface SettingsFormState {
  bio: string;
  email: string;
  image: string;
  password: string;
  username: string;
}

function toFormState(loggedUser: User): SettingsFormState {
  return {
    bio: loggedUser.bio ?? "",
    email: loggedUser.email,
    image: loggedUser.image ?? "",
    password: "",
    username: loggedUser.username,
  };
}

function SettingsForm() {
  const auth = useAuth();
  const [form, setForm] = useState<SettingsFormState>(() =>
    toFormState(auth.loggedUser),
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuth) navigate("/", { replace: true, state: null });
  }, [auth.isAuth, navigate]);

  const handleField = fieldHandler(setForm);

  const formSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const authed = requireAuth(auth);
    if (!authed) return;

    setSubmitting(true);

    userUpdate({ headers: authed.headers, ...form })
      .then((authState) => {
        if (!authState) {
          setErrorMessage("Something went wrong. Please try again.");
          return;
        }

        auth.setAuthState(authState);
      })
      .catch(setErrorMessage)
      .finally(() => setSubmitting(false));
  };

  if (!auth.isAuth) return null;

  return (
    <form onSubmit={formSubmit}>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}

        <FormFieldset
          placeholder="URL of profile picture"
          name="image"
          value={form.image}
          handler={handleField("image")}
        ></FormFieldset>

        <FormFieldset
          placeholder="Your Name"
          name="username"
          required
          value={form.username}
          handler={handleField("username")}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control form-control-lg"
            rows={8}
            placeholder="Short bio about you"
            name="bio"
            value={form.bio}
            onChange={handleField("bio")}
          ></textarea>
        </fieldset>

        <FormFieldset
          placeholder="Email"
          name="email"
          required
          value={form.email}
          handler={handleField("email")}
        ></FormFieldset>

        <FormFieldset
          type="password"
          name="password"
          value={form.password}
          placeholder="Password"
          handler={handleField("password")}
        ></FormFieldset>

        <button
          type="submit"
          className="btn btn-lg btn-primary pull-xs-right"
          disabled={submitting}
        >
          Update Settings
        </button>
      </fieldset>
    </form>
  );
}

export default SettingsForm;
