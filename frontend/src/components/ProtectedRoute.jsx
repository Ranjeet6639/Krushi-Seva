import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    const roleOk = !requiredRole || user?.role === requiredRole;
    setIsAuth(!!token && roleOk);
    setLoading(false);
  }, [requiredRole]);

  if (loading) return null;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
}

export default ProtectedRoute;