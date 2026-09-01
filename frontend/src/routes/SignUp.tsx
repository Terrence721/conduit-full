import { useState } from "react";
import AuthPageContainer from "../components/AuthPageContainer/AuthPageContainer";
import SignUpForm from "../components/SignUpForm/SignUpForm";

function SignUp() {
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  return (
    <AuthPageContainer
      error={errorMessage}
      path="/login"
      text="Sign in to your account"
      title="Sign up"
    >
      <SignUpForm onError={handleError} />
    </AuthPageContainer>
  );
}

export default SignUp;
