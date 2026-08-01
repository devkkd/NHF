import AdminGuard from "@/components/admin/AdminGuard";
import AdminEnquiriesPage from "@/components/admin/AdminEnquiriesPage";

export const metadata = {
  title: "Enquiries — NHF Admin",
};

export default function EnquiriesPage() {
  return (
    <AdminGuard>
      <AdminEnquiriesPage />
    </AdminGuard>
  );
}