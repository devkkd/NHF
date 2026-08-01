import AdminGuard from "@/components/admin/AdminGuard";
import AdminEnquiryDetailsPage from "@/components/admin/AdminEnquiryDetailsPage";

export default async function Page({ params }) {
  const { id } = await params;

  return (
    <AdminGuard>
      <AdminEnquiryDetailsPage enquiryId={id} />
    </AdminGuard>
  );
}