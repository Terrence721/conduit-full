import { useFeedContext, type FeedTabName } from "../../context/FeedContext";

interface FeedNavLinkProps {
  icon?: boolean;
  name: FeedTabName;
  tagName?: string;
  text: string;
}

function FeedNavLink({ icon, name, tagName = "", text }: FeedNavLinkProps) {
  const { tabName, changeTab } = useFeedContext();

  const handleClick = () => {
    changeTab(name, tagName);
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
