"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserProfile from "@/features/auth/components/user-profile-menu";
import Link from "next/link";

export default function Navbar() {
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
            <UserProfile />
            <ModeToggle />
          </div>

          {/* Mobile sheet (shadcn) */}
          <div className="md:hidden ml-2">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu" />
                }
              >
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
                  <UserProfile />
                  <ModeToggle />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
