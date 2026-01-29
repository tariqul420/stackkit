import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "../shared/components/error-boundary";
import PublicLayout from "./layouts/public-layout";
import Home from "../features/home/pages/home";
import About from "../features/about/pages/about";
import NotFound from "../shared/pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default router;
