import useToggleAction from "../../hooks/useToggleAction";
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
  const { loading, toggle } = useToggleAction(handler);

  const className = [
    "btn",
    "btn-sm",
    "btn-outline-primary",
    right && "pull-xs-right",
    favorited && "active",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () =>
    toggle((headers) => toggleFav({ favorited, headers, slug }));

  return (
    <button className={className} disabled={loading} onClick={handleClick}>
      <i className="ion-heart"></i> {text && "Favorite"}
      <span className="counter"> ( {favoritesCount} )</span>
    </button>
  );
}

export default FavButton;
