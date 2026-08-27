{{#if framework == "nextjs"}}
"use client";
{{/if}}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";
import { LayoutDashboard, LogOut, User } from "lucide-react";
{{#if framework == "nextjs"}}
import Link from "next/link";
import { useRouter } from "next/navigation";
{{else}}
import { Link, useNavigate } from "react-router";
{{/if}}
import { useMeQuery } from "../queries/auth.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "../queries/auth.queries";

export default function UserProfileMenu() {
  const { data: user, isLoading } = useMeQuery();
  const queryClient = useQueryClient();
{{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
{{else}}
  const navigate = useNavigate();
{{/if}}

  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.clear();
    navigate("/login");
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) {
    return (
      <Button
        render={
          {{#if framework == "nextjs"}}<Link href="/login" />{{else}}<Link to="/login" />{{/if}}
        }
        variant="ghost"
        size="icon"
        aria-label="Sign in"
        nativeButton={false}
      >
        <User />
      </Button>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-2 rounded-full p-0.5 outline-none ring-2 ring-transparent transition-all hover:ring-border focus-visible:ring-ring"
        aria-label="User menu"
      >
        <Avatar size="default">
          <AvatarImage src={user.image || ""} alt={user.name} referrerPolicy="no-referrer" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-3 px-2 py-2.5">
          <Avatar size="lg">
            <AvatarImage src={user.image || ""} alt={user.name} referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={
            {{#if framework == "nextjs"}}<Link href={user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard"} />{{else}}<Link to={user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard"} />{{/if}}
          }
          className="gap-2"
        >
          <LayoutDashboard className="size-4" /> Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
