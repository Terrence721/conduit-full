import { useContext } from "react";
import { FeedContext } from "../context/FeedContextInstance";
import type { FeedTabName } from "../context/FeedContext";

export { FeedTabName };

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext must be used within a FeedProvider");
  }
  return context;
}

export default useFeedContext;
