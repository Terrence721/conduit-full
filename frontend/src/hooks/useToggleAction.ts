import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import requireAuth, { type AuthedState } from "../helpers/requireAuth";

function useToggleAction<T>(handler: (result: T | undefined) => void) {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const toggle = (
    action: (headers: AuthedState["headers"]) => Promise<T | undefined>,
  ) => {
    const authed = requireAuth(auth);
    if (!authed) return;

    setLoading(true);

    action(authed.headers)
      .then(handler)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return { loading, toggle };
}

export default useToggleAction;
