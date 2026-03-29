import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t mt-8">
      <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} StackKit</div>
        <div className="flex gap-4">
          <Link href="#" className="underline">
            Privacy
          </Link>
          <Link href="#" className="underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
