import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Start as "loading" — don't check token yet
  // This prevents the one-frame flash where localStorage hasn't settled
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token);
    setLoading(false); // now safe to render
  }, []);

  // Show nothing while checking — no flash, no redirect loop
  if (loading) return null;

  // Token missing — send to login
  if (!isAuth) return <Navigate to="/login" replace />;

  // Token exists — render the protected page
  return children;
}

export default ProtectedRoute;