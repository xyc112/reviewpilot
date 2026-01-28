import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
