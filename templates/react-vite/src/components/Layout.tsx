import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-700 p-4">
        <nav className="max-w-7xl mx-auto flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }
          >
            About
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 p-4 mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">Built with Vite + React</p>
      </footer>
    </div>
  );
}

export default Layout;
