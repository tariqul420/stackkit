import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "./components/error-boundary";
import Layout from "./components/layout";
import About from "./pages/about";
import Home from "./pages/home";
import NotFound from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
    ],
  },
  { path: "*", Component: NotFound },
]);

export default router;
