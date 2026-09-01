import { useState } from "react";
import AuthPageContainer from "../components/AuthPageContainer/AuthPageContainer";
import LoginForm from "../components/LoginForm/LoginForm";

function Login() {
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  return (
    <AuthPageContainer
      error={errorMessage}
      path="/register"
      text="Need an account?"
      title="Sign in"
    >
      <LoginForm onError={handleError} />
    </AuthPageContainer>
  );
}

export default Login;
