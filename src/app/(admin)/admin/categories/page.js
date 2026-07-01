import AdminGuard from "@/components/admin/AdminGuard";
import AdminCategories from "@/components/admin/AdminCategories";

export const metadata = { title: "Categories — NHF Admin" };

export default function CategoriesPage() {
  return (
    <AdminGuard>
      <AdminCategories />
    </AdminGuard>
  );
}
