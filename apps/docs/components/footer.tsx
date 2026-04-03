import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Quick Start", href: "/docs/getting-started/quickstart" },
    { label: "CLI Reference", href: "/docs/cli/overview" },
    { label: "Troubleshooting", href: "/docs/reference/troubleshooting" },
  ],
  Community: [
    {
      label: "GitHub",
      href: "https://github.com/tariqul420/stackkit",
      external: true,
    },
    {
      label: "Discord",
      href: "https://discord.gg/PD8XWdpA",
      external: true,
    },
    {
      label: "Contributing",
      href: "/docs/community/contributing",
    },
    {
      label: "Code of Conduct",
      href: "https://github.com/tariqul420/stackkit/blob/main/CODE_OF_CONDUCT.md",
      external: true,
    },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-fd-border bg-fd-card/30">
      <div className="mx-auto max-w-7xl py-12">
        {/* Top row */}
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex max-w-xs flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image src="/fdt.png" className="dark:hidden" alt="StackKit" width={20} height={20} />
              <Image
                src="/fwt.png"
                className="hidden dark:block"
                alt="StackKit"
                width={20}
                height={20}
              />
              <span className="font-semibold">StackKit</span>
            </div>
            <p className="text-sm leading-relaxed text-fd-muted-foreground">
              Open-source scaffolding for modern web projects. Your code, your rules.
            </p>
          </div>

          {/* Link groups */}
          <div className="flex gap-12">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
                  {group}
                </p>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={"external" in link && link.external ? "_blank" : undefined}
                        rel={
                          "external" in link && link.external ? "noopener noreferrer" : undefined
                        }
                        className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-2 border-t border-fd-border pt-6 text-xs text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} StackKit. Released under the MIT License.</p>
          <p>
            Built with{" "}
            <a
              href="https://fumadocs.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fd-foreground underline underline-offset-2"
            >
              Fumadocs
            </a>
            {" & "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fd-foreground underline underline-offset-2"
            >
              Next.js
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
