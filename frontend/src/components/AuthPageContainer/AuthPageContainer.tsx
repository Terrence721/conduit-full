import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import ContainerRow from "../ContainerRow/ContainerRow";

interface AuthPageContainerProps {
  children: ReactNode;
  error?: string;
  path: string;
  text: string;
  title: string;
}

function AuthPageContainer({
  children,
  error,
  path,
  text,
  title,
}: AuthPageContainerProps) {
  return (
    <div className="auth-page">
      <ContainerRow page>
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">{title}</h1>
          <p className="text-xs-center">
            <Link to={path}>{text}</Link>
          </p>

          {error && (
            <ul className="error-messages">
              <li>{error}</li>
            </ul>
          )}

          {children}
        </div>
      </ContainerRow>
    </div>
  );
}

export default AuthPageContainer;
