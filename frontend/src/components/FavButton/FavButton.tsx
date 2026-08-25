import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toggleFav from "../../services/toggleFav";
import type { Article } from "../../types";

interface FavButtonProps {
  favorited: boolean;
  favoritesCount: number;
  handler: (article: Article | undefined) => void;
  right?: boolean;
  slug: string;
  text?: boolean;
}

function FavButton({
  favorited,
  favoritesCount,
  handler,
  right,
  slug,
  text,
}: FavButtonProps) {
  const [loading, setLoading] = useState(false);
  const { headers, isAuth } = useAuth();

  const buttonText = text ? "Favorite" : "";
  const className = [
    "btn",
    "btn-sm",
    "btn-outline-primary",
    right && "pull-xs-right",
    favorited && "active",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (!isAuth || !headers) return alert("You need to login first");

    setLoading(true);

    toggleFav({ favorited, headers, slug })
      .then(handler)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <button className={className} disabled={loading} onClick={handleClick}>
      <i className="ion-heart"></i> {buttonText}
      <span className="counter"> ( {favoritesCount} )</span>
    </button>
  );
}

export default FavButton;
