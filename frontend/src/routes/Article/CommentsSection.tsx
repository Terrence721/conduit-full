import { useState } from "react";
import CommentEditor from "../../components/CommentEditor/CommentEditor";
import CommentList from "../../components/CommentList/CommentList";

function CommentsSection() {
  const [comment, setComment] = useState<unknown>({});

  const handleUpdates = (update: unknown) => {
    setComment(update);
  };

  return (
    <div className="row">
      <div className="col-xs-12 col-md-8 offset-md-2">
        <CommentEditor updateComments={handleUpdates} />
        <CommentList triggerUpdate={comment} updateComments={handleUpdates} />
      </div>
    </div>
  );
}

export default CommentsSection;
