import { useFeedContext } from "../../context/FeedContext";

interface FeedNavLinkProps {
  icon?: boolean;
  name: string;
  text: string;
}

function FeedNavLink({ icon, name, text }: FeedNavLinkProps) {
  const { tabName, changeTab } = useFeedContext();

  const handleClick = () => {
    changeTab(name, name === "tag" ? text : "");
  };

  return (
    <li className="nav-item">
      <button
        className={`nav-link${tabName === name ? " active" : ""}`}
        onClick={handleClick}
      >
        {icon ? (
          <>
            <i className="ion-pound"></i> {text}
          </>
        ) : (
          text
        )}
      </button>
    </li>
  );
}

export default FeedNavLink;
