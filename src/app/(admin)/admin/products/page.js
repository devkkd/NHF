import AdminGuard from "@/components/admin/AdminGuard";
import AdminProducts from "@/components/admin/AdminProducts";

export const metadata = { title: "Products — NHF Admin" };

export default function ProductsPage() {
  return (
    <AdminGuard>
      <AdminProducts />
    </AdminGuard>
  );
}
