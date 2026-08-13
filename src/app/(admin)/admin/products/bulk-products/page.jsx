import AdminGuard from "@/components/admin/AdminGuard";
import AdminBulkProductUpload from "@/components/admin/AdminBulkProductUpload";

export const metadata = {
  title: "Bulk Products — NHF Admin",
};

export default function BulkProductsPage() {
  return (
    <AdminGuard>
      <AdminBulkProductUpload />
    </AdminGuard>
  );
}