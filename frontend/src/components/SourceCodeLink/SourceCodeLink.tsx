import { REPO_URL } from "../../constants";

interface SourceCodeLinkProps {
  position: "left" | "right";
}

function SourceCodeLink({ position }: SourceCodeLinkProps) {
  return (
    <ul className={`nav navbar-nav pull-xs-${position}`}>
      <li className="nav-item">
        <a className="nav-link" href={REPO_URL}>
          <i className="ion-social-github"></i> Source code
        </a>
      </li>
    </ul>
  );
}

export default SourceCodeLink;
