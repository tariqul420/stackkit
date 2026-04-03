"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useMeQuery } from "@/features/auth/queries/auth.querie";
import ProfileForm from "./profile-form";

export default function MyProfile() {
  const { data: user, isLoading } = useMeQuery();

  if (isLoading || !user) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-6 rounded-lg border bg-card p-6">
              <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 border-t pt-6">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileForm user={user} />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Account Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="capitalize">{user.role || "User"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="truncate font-mono text-xs">
                  {user.id.slice(0, 8)}...{user.id.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email Verified</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Login</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-muted bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              💡 <span className="font-medium">Tip:</span> Keep your profile
              information up to date for better security and communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
