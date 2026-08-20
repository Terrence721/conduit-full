import {
  createContext,
  useContext,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface FeedTab {
  tabName: string;
  tagName: string;
}

interface FeedContextValue extends FeedTab {
  changeTab: (e: MouseEvent<HTMLElement>, tabName: string) => void;
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

  const changeTab = (e: MouseEvent<HTMLElement>, tabName: string) => {
    const tagName = e.currentTarget.innerText.trim();
    setTab({ tabName, tagName });
  };

  return (
    <FeedContext.Provider value={{ changeTab, tabName, tagName }}>
      {children}
    </FeedContext.Provider>
  );
}

export default FeedProvider;
