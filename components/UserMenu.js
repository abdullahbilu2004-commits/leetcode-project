"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Bookmark, History, LogOut, Settings, User } from "lucide-react";

const items = [
  { href: "/profile", label: "Profile", Icon: User },
  { href: "/bookmarks", label: "Bookmarks", Icon: Bookmark },
  { href: "/submissions", label: "Submissions", Icon: History },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function UserMenu({ username }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const down = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, []);
  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) return toast.error("Could not log out. Try again.");
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm transition-colors hover:bg-raised">
        <User size={15} /> <span className="max-w-24 truncate">{username}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-line bg-surface p-1 shadow-lg">
          {items.map(({ href, label, Icon }) => (
            <Link key={href} href={href} role="menuitem" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-raised">
              <Icon size={15} className="text-muted" /> {label}
            </Link>
          ))}
          <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-hard hover:bg-raised">
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
