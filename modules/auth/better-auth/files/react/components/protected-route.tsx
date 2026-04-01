import { useMeQuery } from "@/features/auth/queries/auth.querie";
import { Navigate, Outlet, useLocation } from "react-router";

interface ProtectedRouteProps {
  requiredRole?: string;
  redirectTo?: string;
  redirectRoleTo?: { role: string; to: string };
}

export default function ProtectedRoute({
  requiredRole,
  redirectTo = "/dashboard",
  redirectRoleTo,
}: ProtectedRouteProps) {
  const { data: user, isLoading } = useMeQuery();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (redirectRoleTo && user.role === redirectRoleTo.role) {
    return <Navigate to={redirectRoleTo.to} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
