import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in" };

export default async function Page({ searchParams }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect("/problems");
  return (
    <main className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-4">
      <AuthForm mode="login" next={Array.isArray(next) ? next[0] : next} />
    </main>
  );
}
