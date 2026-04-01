import { AUTH_QUERY_KEYS } from "@/features/auth/queries/auth.querie";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface JwtPayload {
  role?: string;
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as JwtPayload;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, exp?: number) {
  const expires = exp ? new Date(exp * 1000).toUTCString() : "";
  document.cookie = `${name}=${value}; path=/; SameSite=Lax${expires ? `; expires=${expires}` : ""}`;
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const redirectPath = searchParams.get("redirect");

    if (accessToken) {
      const payload = decodeJwt(accessToken);
      setCookie("accessToken", accessToken, payload?.exp);

      if (refreshToken) {
        const refreshPayload = decodeJwt(refreshToken);
        setCookie("refreshToken", refreshToken, refreshPayload?.exp);
      }

      const defaultRoute = payload?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard";
      const destination = redirectPath || defaultRoute;

      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me }).then(() => {
        navigate(destination, { replace: true });
      });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, queryClient, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
