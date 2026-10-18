import Link from "next/link";
import { Code2, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4" aria-label="Main">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold"><Code2 size={20} className="text-accent" />Practice</Link>
          <Link href="/problems" className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
            <ListChecks size={16} /> Problems
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? <UserMenu username={user.username} /> : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm text-muted hover:text-fg">Log in</Link>
              <Link href="/signup" className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
