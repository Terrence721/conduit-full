import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import requireAuth from "../../helpers/requireAuth";
import toggleFollow from "../../services/toggleFollow";
import type { Profile } from "../../types";

interface FollowButtonProps {
  followersCount: number;
  following: boolean;
  handler: (profile: Profile | undefined) => void;
  username: string;
}

function FollowButton({
  followersCount,
  following,
  handler,
  username,
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const iconStyle = following ? "ion-minus-round" : "ion-plus-round";
  const text = !auth.isAuth ? "Followers" : following ? "Unfollow" : "Follow";

  const handleClick = () => {
    const authed = requireAuth(auth);
    if (!authed) return;

    setLoading(true);

    toggleFollow({ following, headers: authed.headers, username })
      .then(handler)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <>
      <button
        className={`btn btn-sm action-btn${following ? " btn-secondary" : ""}`}
        disabled={loading}
        onClick={handleClick}
        style={{ color: "#777" }}
      >
        {auth.isAuth && <i className={iconStyle}></i>} {text}{" "}
        {auth.isAuth && username}
        <span className="counter"> ( {followersCount} )</span>
      </button>{" "}
    </>
  );
}

export default FollowButton;
