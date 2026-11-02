import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { FeedContext } from "./FeedContextInstance";

import type { FeedTabName } from "./FeedContextInstance";
export type { FeedTabName };

interface FeedTab {
  tabName: FeedTabName;
  tagName: string;
}

interface FeedProviderProps {
  children: ReactNode;
}

function FeedProvider({ children }: FeedProviderProps) {
  const { isAuth } = useAuth();
  const [{ tabName, tagName }, setTab] = useState<FeedTab>({
    tabName: isAuth ? "feed" : "global",
    tagName: "",
  });
  const [prevIsAuth, setPrevIsAuth] = useState(isAuth);

  if (isAuth !== prevIsAuth) {
    setPrevIsAuth(isAuth);
    setTab((tab) => ({ ...tab, tabName: isAuth ? "feed" : "global" }));
  }

  const changeTab = useCallback((tabName: FeedTabName, tagName: string) => {
    setTab({ tabName, tagName });
  }, []);

  const value = useMemo(
    () => ({ changeTab, tabName, tagName }),
    [changeTab, tabName, tagName],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export default FeedProvider;
