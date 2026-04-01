import {
    DashboardSidebarMenuGroup,
    IconMapKey,
} from "@/components/dashboard/dashboard-sidebar";

export const ADMIN: DashboardSidebarMenuGroup[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/admin",
        icon: "LayoutDashboard" as IconMapKey,
      },
      {
        title: "Users",
        url: "/dashboard/admin/users",
        icon: "Users" as IconMapKey,
      },
      {
        title: "Content",
        url: "/dashboard/admin/content",
        icon: "Package" as IconMapKey,
      },
      {
        title: "Categories",
        url: "/dashboard/admin/categories",
        icon: "Tag" as IconMapKey,
      },
    ],
  },
  {
    label: "Media",
    items: [
      {
        title: "Images",
        url: "/dashboard/admin/media/images",
        icon: "Image" as IconMapKey,
      },
      {
        title: "Videos",
        url: "/dashboard/admin/media/videos",
        icon: "Clapperboard" as IconMapKey,
      },
    ],
  },
  {
    label: "Security & Support",
    items: [
      {
        title: "Roles & Permissions",
        url: "/dashboard/admin/roles",
        icon: "Shield" as IconMapKey,
      },
      {
        title: "Support",
        url: "/dashboard/admin/support",
        icon: "LifeBuoy" as IconMapKey,
      },
    ],
  },
];

export const USER: DashboardSidebarMenuGroup[] = [
  {
    label: "Navigation",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: "LayoutDashboard" as IconMapKey,
      },
      {
        title: "Activity",
        url: "/dashboard/activity",
        icon: "List" as IconMapKey,
      },
      {
        title: "Saved",
        url: "/dashboard/saved",
        icon: "Heart" as IconMapKey,
      },
    ],
  },
];

export const sidebar = {
  ADMIN,
  USER,
};