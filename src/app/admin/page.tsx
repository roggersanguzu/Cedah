import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
export default async function AdminPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) redirect("/admin/login");
  return <AdminDashboard name={session.name} email={session.email} />;
}
