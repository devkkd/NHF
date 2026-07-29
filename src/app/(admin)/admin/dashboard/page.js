import AdminGuard from "@/components/admin/AdminGuard";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = { title: "Dashboard — NHF Admin" };

export default function DashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
