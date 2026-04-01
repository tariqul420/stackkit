import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "./components/error-boundary";
import Layout from "./components/layout";
import { AdminRoute, UserRoute } from "./components/route-guards";
import ForgotPasswordPage from "./features/auth/pages/forgot-password";
import LoginPage from "./features/auth/pages/login";
import OAuthCallbackPage from "./features/auth/pages/oauth-callback";
import RegisterPage from "./features/auth/pages/register";
import ResetPasswordPage from "./features/auth/pages/reset-password";
import VerifyEmailPage from "./features/auth/pages/verify-email";
import AdminOverview from "./features/dashboard/admin/pages/overview";
import DashboardOverview from "./features/dashboard/pages/overview";
import About from "./features/pages/about";
import Home from "./features/pages/home";
import NotFound from "./features/pages/not-found";
import DashboardLayout from "./layouts/dashboard-layout";

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
  {
    Component: DashboardLayout,
    children: [
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "reset-password", Component: ResetPasswordPage },
      { path: "verify-email", Component: VerifyEmailPage },
    ],
  },
  {
    Component: UserRoute,
    children: [
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: DashboardOverview },
        ],
      },
    ],
  },
  {
    Component: AdminRoute,
    children: [
      {
        path: "dashboard/admin",
        Component: DashboardLayout,
        children: [{ index: true, Component: AdminOverview }],
      },
    ],
  },
  { path: "api/auth/callback/:provider", Component: OAuthCallbackPage },
  { path: "*", Component: NotFound },
]);

export default router;
