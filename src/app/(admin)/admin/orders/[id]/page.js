import AdminGuard from "@/components/admin/AdminGuard";
import AdminOrderDetails from "@/components/admin/AdminOrderDetails";

export const metadata = {
  title: "Order Details — NHF Admin",
};

export default function OrderDetailsPage() {
  return (
    <AdminGuard>
      <AdminOrderDetails />
    </AdminGuard>
  );
}