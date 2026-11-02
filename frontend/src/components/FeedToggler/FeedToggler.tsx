import { useAuth } from "../../hooks/useAuth";
import { useFeedContext } from "../../hooks/useFeedContext";
import FeedNavLink from "./FeedNavLink";

function FeedToggler() {
  const { isAuth } = useAuth();
  const { tabName, tagName } = useFeedContext();

  return (
    <div className="feed-toggle">
      <ul className="nav nav-pills outline-active">
        {isAuth && <FeedNavLink name="feed" text="Your Feed" />}

        <FeedNavLink name="global" text="Global Feed" />

        {tabName === "tag" && (
          <FeedNavLink icon name="tag" tagName={tagName} text={tagName} />
        )}
      </ul>
    </div>
  );
}

export default FeedToggler;
