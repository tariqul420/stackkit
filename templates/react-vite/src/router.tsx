import { createBrowserRouter } from "react-router";
import { userService } from "./api/services/user.service";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import About from "./pages/About";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      {
        path: "users/:userId",
        loader: async ({ params }) => {
          const id = params.userId;
          if (!id) throw new Response("Missing user id", { status: 400 });
          const user = await userService.getUser(id);
          return user;
        },
        Component: UserProfile,
      },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default router;
