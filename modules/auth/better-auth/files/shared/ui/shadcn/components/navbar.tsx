"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMeQuery } from "@/features/auth/queries/auth.querie";
import Link from "next/link";

export default function Navbar() {
  const { data } = useMeQuery();

  const user = data as { name?: string; image?: string; role: string } | null;
  const role = user?.role;

  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          StackKit
        </Link>

        <nav className="relative flex items-center">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground">
              Home
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground">
              Docs
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4 ml-4">
            {user ? (
              <Link href={role === "ADMIN" ? "/dashboard/admin" : "/dashboard"}>
                <Avatar>
                  {user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.name ?? "profile"}
                    />
                  ) : (
                    <AvatarFallback>
                      {(user.name || "")
                        .split(" ")
                        .map((s: string) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm px-3 py-1 bg-black text-white rounded-md"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile sheet (shadcn) */}
          <div className="md:hidden ml-2">
            <Sheet>
              <SheetTrigger>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12h18M3 6h18M3 18h18"
                    />
                  </svg>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" showCloseButton>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate the site</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-3 p-2">
                  <Link
                    href="/"
                    className="px-3 py-2 rounded-md text-sm hover:bg-muted"
                  >
                    Home
                  </Link>
                  <Link
                    href="/docs"
                    className="px-3 py-2 rounded-md text-sm hover:bg-muted"
                  >
                    Docs
                  </Link>

                  <div className="border-t my-2" />

                  {user ? (
                    <Link
                      href={
                        role === "ADMIN" ? "/dashboard/admin" : "/dashboard"
                      }
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm"
                    >
                      <Avatar size="sm">
                        {user.image ? (
                          <AvatarImage
                            src={user.image}
                            alt={user.name ?? "profile"}
                          />
                        ) : (
                          <AvatarFallback>
                            {(user.name || "")
                              .split(" ")
                              .map((s: string) => s[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{user.name ?? "Profile"}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="px-3 py-2 rounded-md text-sm"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
