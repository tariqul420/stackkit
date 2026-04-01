{{#if framework == "nextjs"}}
import Link from "next/link";
{{else}}
import { Link } from "react-router";
{{/if}}

const footerLinks = [
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t mt-8">
      <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} StackKit</div>
        <div className="flex gap-4">
          {{#if framework == "nextjs"}}
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="underline">
              {link.name}
            </Link>
          ))}
          {{else}}
          {footerLinks.map((link) => (
            <Link key={link.href} to={link.href} className="underline">
              {link.name}
            </Link>
          ))}
          {{/if}}
        </div>
      </div>
    </footer>
  );
}
