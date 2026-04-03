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
import { LayoutDashboard, LogOut, User } from "lucide-react";
{{#if framework == "nextjs"}}
import Link from "next/link";
{{else}}
import { Link } from "react-router";
{{/if}}
import { useLogoutMutation } from "../queries/auth.mutations";
import { useMeQuery } from "../queries/auth.querie";

export default function UserProfileMenu() {
  const { data: user, isLoading } = useMeQuery();
  const { mutate: logout, isPending } = useLogoutMutation();

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
        {/* User info header */}
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
            {{#if framework == "nextjs"}}<Link href="/dashboard" />{{else}}<Link to="/dashboard" />{{/if}}
          }
          className="gap-2"
        >
          <LayoutDashboard className="size-4" /> Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() => logout()}
          className="gap-2"
        >
          <LogOut className="size-4" />
          {isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
