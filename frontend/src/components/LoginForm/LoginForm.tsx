import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userLogin from "../../services/userLogin";
import FormFieldset from "../FormFieldset/FormFieldset";

interface LoginFormProps {
  onError: (error: string) => void;
}

function LoginForm({ onError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    userLogin({ email, password })
      .then((authState) => {
        if (!authState) return;
        setAuthState(authState);
        navigate("/");
      })
      .catch(onError);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        type="email"
        name="email"
        required
        placeholder="Email"
        value={email}
        handler={(e) => setEmail(e.target.value)}
        autoFocus
      ></FormFieldset>

      <FormFieldset
        name="password"
        type="password"
        required
        placeholder="Password"
        value={password}
        handler={(e) => setPassword(e.target.value)}
        minLength={5}
      ></FormFieldset>
      <button className="btn btn-lg btn-primary pull-xs-right">Login</button>
    </form>
  );
}

export default LoginForm;
