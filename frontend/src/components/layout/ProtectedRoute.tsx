import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { ROUTES } from "@/routes";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
