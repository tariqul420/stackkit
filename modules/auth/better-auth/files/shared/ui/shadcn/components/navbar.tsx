{{#if framework == "nextjs"}}
"use client";
{{/if}}

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
{{#if framework == "nextjs"}}
import Link from "next/link";
import { usePathname } from "next/navigation";
{{else}}
import { Link, NavLink } from "react-router";
{{/if}}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "/docs" },
];

export default function Navbar() {
  {{#if framework == "nextjs"}}
  const pathname = usePathname();
  {{/if}}

  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        {{#if framework == "nextjs"}}
        <Link href="/" className="text-lg font-bold">
          StackKit
        </Link>
        {{else}}
        <Link to="/" className="text-lg font-bold">
          StackKit
        </Link>
        {{/if}}

        <nav className="relative flex items-center">
          <div className="hidden md:flex items-center gap-4">
            {{#if framework == "nextjs"}}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${pathname === link.href ? "active" : "text-muted-foreground"}`}
              >
                {link.name}
              </Link>
            ))}
            {{else}}
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-sm ${isActive ? "active" : "text-muted-foreground"}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {{/if}}
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
                  {{#if framework == "nextjs"}}
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm hover:bg-muted ${pathname === link.href ? "active" : ""}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {{else}}
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm hover:bg-muted ${isActive ? "active" : ""}`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                  {{/if}}

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
