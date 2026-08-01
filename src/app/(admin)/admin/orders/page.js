import AdminGuard from "@/components/admin/AdminGuard";
import AdminOrdersPage from "@/components/admin/AdminOrdersPage";

export const metadata = {
  title: "Orders — NHF Admin",
};

export default function OrdersPage() {
  return (
    <AdminGuard>
      <AdminOrdersPage />
    </AdminGuard>
  );
}