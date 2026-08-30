import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import handleAuthResult from "../../helpers/handleAuthResult";
import userSignUp from "../../services/userSignUp";
import FormFieldset from "../FormFieldset/FormFieldset";

interface SignUpFormProps {
  onError: (error: string) => void;
}

function SignUpForm({ onError }: SignUpFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    userSignUp({ username, email, password })
      .then((authState) =>
        handleAuthResult(authState, setAuthState, navigate, onError),
      )
      .catch(onError);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        name="username"
        required
        placeholder="Your Name"
        value={username}
        handler={(e) => setUsername(e.target.value)}
      ></FormFieldset>

      <FormFieldset
        name="email"
        type="email"
        required
        placeholder="Email"
        value={email}
        handler={(e) => setEmail(e.target.value)}
      ></FormFieldset>

      <FormFieldset
        name="password"
        type="password"
        required
        placeholder="Password"
        value={password}
        handler={(e) => setPassword(e.target.value)}
      ></FormFieldset>
      <button className="btn btn-lg btn-primary pull-xs-right">Sign up</button>
    </form>
  );
}

export default SignUpForm;
