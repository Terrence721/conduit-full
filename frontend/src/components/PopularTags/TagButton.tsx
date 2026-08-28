import { useFeedContext } from "../../context/FeedContext";

interface TagButtonProps {
  tagsList: string[];
}

function TagButton({ tagsList }: TagButtonProps) {
  const { changeTab } = useFeedContext();

  return tagsList.slice(0, 50).map((name) => (
    <button
      className="tag-pill tag-default"
      key={name}
      onClick={() => changeTab("tag", name)}
    >
      {name}
    </button>
  ));
}

export default TagButton;
