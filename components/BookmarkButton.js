"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function BookmarkButton({ slug, initial = false, loggedIn }) {
  const [on, setOn] = useState(initial);
  const router = useRouter();
  async function toggle() {
    if (!loggedIn) { toast("Log in to bookmark problems."); return router.push("/login"); }
    setOn(!on);
    const res = await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
    if (!res.ok) { setOn(on); return toast.error("Could not update bookmark."); }
    const data = await res.json();
    setOn(data.bookmarked);
    toast.success(data.bookmarked ? "Bookmarked" : "Bookmark removed");
    router.refresh();
  }
  return (
    <button onClick={toggle} aria-pressed={on} aria-label={on ? "Remove bookmark" : "Add bookmark"}
      className={`grid size-8 place-items-center rounded-md transition-colors hover:bg-raised ${on ? "text-accent" : "text-muted"}`}>
      {on ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
    </button>
  );
}
