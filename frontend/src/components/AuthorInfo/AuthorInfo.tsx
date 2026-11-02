import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import getProfile from "../../services/getProfile";
import Avatar from "../Avatar/Avatar";
import FollowButton from "../FollowButton/FollowButton";
import type { Profile } from "../../types";
import errorHandler from "../../helpers/errorHandler";

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
    if (!username) return;

    getProfile({ headers, username })
      .then((profile) => {
        if (!profile) return;
        setAuthor(profile);
      })
      .catch((error) => {
        errorHandler(error);
        navigate("/not-found", { replace: true });
      });
  }, [username, headers, navigate]);

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
    <div className="writer-card">
      <span className="writer-card-mark" aria-hidden="true">
        ✦
      </span>
      <Avatar alt={username} className="user-img" src={author.image} />
      <h3>{username}</h3>

      {author.bio && (
        <Markdown options={{ forceBlock: true }}>{author.bio}</Markdown>
      )}

      {username === loggedUser.username ? (
        <Link className="primary-button" to="/settings">
          Edit Profile Settings
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
