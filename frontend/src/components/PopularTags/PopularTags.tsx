import { useEffect, useState } from "react";
import getTags from "../../services/getTags";
import TagButton from "./TagButton";

function PopularTags() {
  const [tags, setTags] = useState<string[] | null>(null);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch((error: unknown) => {
        console.error(error);
        setTags([]);
      });
  }, []);

  return (
    <aside className="col-md-3">
      <div className="sidebar">
        <h6>Popular Tags</h6>
        <div className="tag-list">
          {tags === null ? (
            <p>Loading tags...</p>
          ) : tags.length > 0 ? (
            <TagButton tagsList={tags} />
          ) : (
            <p>Tags list not available</p>
          )}
        </div>
      </div>
    </aside>
  );
}

export default PopularTags;
