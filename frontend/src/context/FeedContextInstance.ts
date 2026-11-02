import { createContext } from "react";

export type FeedTabName = "feed" | "global" | "tag";

interface FeedTab {
  tabName: FeedTabName;
  tagName: string;
}

interface FeedContextValue extends FeedTab {
  changeTab: (tabName: FeedTabName, tagName: string) => void;
}

export const FeedContext = createContext<FeedContextValue | undefined>(
  undefined,
);
