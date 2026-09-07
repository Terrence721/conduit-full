import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function useRequireAuthRedirect() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuth) navigate("/", { replace: true, state: null });
  }, [auth.isAuth, navigate]);

  return auth;
}

export default useRequireAuthRedirect;
