export const dynamic = "force-dynamic";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/features/auth/services/auth.service";
import { sidebar } from "@/lib/constant/dashboard";
import { redirect } from "next/navigation";

type Role = keyof typeof sidebar;

export default async function layout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const role = user?.role as Role | undefined;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {role && <DashboardSidebar menu={sidebar[role]} user={user} />}

        <div className="flex flex-col flex-1">
          <DashboardHeader role={role} />

          <main className="flex-1">
            <div className="@container/main min-h-screen w-full px-4 py-4 lg:px-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
