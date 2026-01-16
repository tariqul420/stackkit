import { Outlet } from "react-router";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
