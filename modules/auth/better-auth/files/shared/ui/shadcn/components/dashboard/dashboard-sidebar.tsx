{{#if framework == "nextjs"}}
"use client";
{{/if}}

import {
  ChevronRight,
  Clapperboard,
  Heart,
  Image,
  LayoutDashboard,
  LifeBuoy,
  List,
  MoreVertical,
  Package,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
{{#if framework == "nextjs"}}
import Link from "next/link";
import { usePathname } from "next/navigation";
{{else}}
import { Link, useLocation } from "react-router";
{{/if}}

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/features/auth/queries/auth.mutations";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";


const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Shield,
  LifeBuoy,
  List,
  Heart,
  Image,
  Clapperboard,
} as const;
export type IconMapKey = keyof typeof iconMap;

export interface DashboardSidebarMenuItem {
  title: string;
  url: string;
  icon: IconMapKey;
}

export interface DashboardSidebarMenuGroup {
  label: string;
  items: DashboardSidebarMenuItem[];
}

export interface DashboardSidebarProps {
  menu: DashboardSidebarMenuItem[] | DashboardSidebarMenuGroup[];
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function DashboardSidebar({ menu = [], user }: DashboardSidebarProps) {
  {{#if framework == "nextjs"}}
  const pathname = usePathname();
  {{else}}
  const { pathname } = useLocation();
  {{/if}}
  const { toggleSidebar } = useSidebar();
  const { mutate: logout, isPending } = useLogoutMutation();

  const isActive = (url: string) =>
    url === "/dashboard" ||
    url === "/dashboard/admin"
      ? pathname === url
      : pathname.startsWith(url);

  const groupedMenu = (
    menu.length > 0 && "items" in menu[0]
      ? (menu as DashboardSidebarMenuGroup[])
      : [{ label: "Navigation", items: menu as DashboardSidebarMenuItem[] }]
  ).filter((group) => group.items.length > 0);

  return (
    <Sidebar className="bg-linear-to-b from-background to-muted/30 backdrop-blur supports-backdrop-filter:bg-background/80">
      <SidebarHeader className="px-3 py-2">
        <div className="flex items-center justify-between">
          {{#if framework == "nextjs"}}
          <Link href="/" className="text-lg font-bold">
            StackKit
          </Link>
          {{else}}
          <Link to="/" className="text-lg font-bold">
            StackKit
          </Link>
          {{/if}}
          {/* Collapser for small screens */}
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground lg:hidden"
            aria-label="Toggle sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        {groupedMenu.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium tracking-wide text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon] ?? LayoutDashboard;
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        render={
                          {{#if framework == "nextjs"}}
                          <Link
                            href={item.url || "#"}
                            onClick={() => {
                              if (
                                typeof window !== "undefined" &&
                                window.innerWidth < 768
                              ) {
                                toggleSidebar();
                              }
                            }}
                          />
                          {{else}}
                          <Link
                            to={item.url || "/"}
                            onClick={() => {
                              if (
                                typeof window !== "undefined" &&
                                window.innerWidth < 768
                              ) {
                                toggleSidebar();
                              }
                            }}
                          />
                          {{/if}}
                        }
                        className={cn(
                          "hover:bg-muted dark:hover:bg-muted/80",
                          active && "bg-muted dark:bg-muted/80",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <Separator className="mt-auto" />

      <SidebarFooter className="border-t bg-muted/40 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-muted">
            <span className="flex items-center gap-3">
              <span className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.image || "/assets/images/logo.png"}
                    alt={user?.name || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user?.name?.toUpperCase().charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full border-2 border-background bg-primary"
                  aria-label="Online"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {user?.name || "Admin"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </span>
            </span>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>
                {{#if framework == "nextjs"}}
                <Link href="/dashboard/my-profile">Profile</Link>
                {{else}}
                <Link to="/dashboard/my-profile">Profile</Link>
                {{/if}}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isPending} onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
