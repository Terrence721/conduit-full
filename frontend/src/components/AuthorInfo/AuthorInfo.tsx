import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getProfile from "../../services/getProfile";
import Avatar from "../Avatar/Avatar";
import FollowButton from "../FollowButton/FollowButton";
import type { Profile } from "../../types";

type AuthorState = Omit<Profile, "username">;

const emptyAuthor: AuthorState = {
  bio: null,
  image: null,
  following: false,
  followersCount: 0,
};

function AuthorInfo() {
  const { state }: { state: AuthorState | null } = useLocation();
  const [author, setAuthor] = useState<AuthorState>(state ?? emptyAuthor);
  const { headers, loggedUser } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (state || !username) return;

    getProfile({ headers, username })
      .then((profile) => {
        if (!profile) return;
        setAuthor(profile);
      })
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [username, headers, state, navigate]);

  const followHandler = (updated: Profile | undefined) => {
    if (!updated) return;
    setAuthor((prev) => ({
      ...prev,
      followersCount: updated.followersCount,
      following: updated.following,
    }));
  };

  if (!username) return null;

  return (
    <div className="col-xs-12 col-md-10 offset-md-1">
      <Avatar alt={username} className="user-img" src={author.image} />
      <h4>{username}</h4>

      {author.bio && (
        <Markdown options={{ forceBlock: true }}>{author.bio}</Markdown>
      )}

      {username === loggedUser.username ? (
        <Link
          className="btn btn-sm btn-outline-secondary action-btn"
          to="/settings"
        >
          <i className="ion-gear-a"></i> Edit Profile Settings
        </Link>
      ) : (
        <FollowButton
          followersCount={author.followersCount}
          following={author.following}
          handler={followHandler}
          username={username}
        />
      )}
    </div>
  );
}

export default AuthorInfo;
