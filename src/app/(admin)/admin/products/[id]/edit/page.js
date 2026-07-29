import AdminGuard from "@/components/admin/AdminGuard";
import AdminProductForm from "@/components/admin/AdminProductForm";

export const metadata = { title: "Edit Product — NHF Admin" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return (
    <AdminGuard>
      <AdminProductForm productId={id} />
    </AdminGuard>
  );
}
