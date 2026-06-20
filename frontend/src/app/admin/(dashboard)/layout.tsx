import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

type Props = { children: React.ReactNode };

// Auth gate for the protected admin pages (everything except /admin/login).
export default async function DashboardLayout({ children }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <AdminShell user={session}>{children}</AdminShell>;
}