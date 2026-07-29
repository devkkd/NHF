import AdminGuard from "@/components/admin/AdminGuard";
import AdminProductForm from "@/components/admin/AdminProductForm";

export const metadata = { title: "New Product — NHF Admin" };

export default function NewProductPage() {
  return (
    <AdminGuard>
      <AdminProductForm />
    </AdminGuard>
  );
}
