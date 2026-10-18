"use client";
import { Toaster } from "react-hot-toast";
export default function ToasterProvider() {
  return <Toaster position="bottom-right" toastOptions={{ style: { background: "var(--raised)", color: "var(--fg)", border: "1px solid var(--line)" } }} />;
}
