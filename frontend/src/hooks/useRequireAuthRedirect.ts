import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function useRequireAuthRedirect() {
  const auth = useAuth();
  const navigate = useNavigate();

  const redirectHome = useCallback(
    () => navigate("/", { replace: true, state: null }),
    [navigate],
  );

  useEffect(() => {
    if (!auth.isAuth) redirectHome();
  }, [auth.isAuth, redirectHome]);

  return { ...auth, redirectHome };
}

export default useRequireAuthRedirect;
