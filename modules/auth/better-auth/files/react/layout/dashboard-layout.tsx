import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useMeQuery } from "@/features/auth/queries/auth.querie";
import { sidebar } from "@/lib/constant/dashboard";
import { Navigate, Outlet, useLocation } from "react-router";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export default function DashboardLayout() {
  const { data: user, isLoading } = useMeQuery();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && AUTH_PATHS.includes(pathname)) {
    const dest = user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard";
    return <Navigate to={dest} replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Outlet />
      </div>
    );
  }

  const role = user.role in sidebar ? (user.role as keyof typeof sidebar) : "USER";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar menu={sidebar[role]} user={user} />

        <div className="flex flex-col flex-1">
          <DashboardHeader role={role as "USER" | "ADMIN"} />

          <main className="flex-1">
            <div className="@container/main min-h-screen w-full px-4 py-4 lg:px-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
