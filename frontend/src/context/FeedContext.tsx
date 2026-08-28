import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export type FeedTabName = "feed" | "global" | "tag";

interface FeedTab {
  tabName: FeedTabName;
  tagName: string;
}

interface FeedContextValue extends FeedTab {
  changeTab: (tabName: FeedTabName, tagName: string) => void;
}

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

export function useFeedContext(): FeedContextValue {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext must be used within a FeedProvider");
  }
  return context;
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
