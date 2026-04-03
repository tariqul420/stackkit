import ProtectedRoute from "./protected-route";

export function AuthenticatedRoute() {
  return <ProtectedRoute />;
}

export function UserRoute() {
  return <ProtectedRoute redirectRoleTo={{ role: "ADMIN", to: "/dashboard/admin" }} />;
}

export function AdminRoute() {
  return <ProtectedRoute requiredRole="ADMIN" redirectTo="/dashboard" />;
}
