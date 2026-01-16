import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import About from "./pages/About";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default router;
