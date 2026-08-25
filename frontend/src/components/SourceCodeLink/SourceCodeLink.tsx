interface SourceCodeLinkProps {
  position: "left" | "right";
}

function SourceCodeLink({ position }: SourceCodeLinkProps) {
  return (
    <ul className={`nav navbar-nav pull-xs-${position}`}>
      <li className="nav-item">
        <a
          className="nav-link"
          href="https://github.com/Terrence721/conduit-full"
        >
          <i className="ion-social-github"></i> Source code
        </a>
      </li>
    </ul>
  );
}

export default SourceCodeLink;
