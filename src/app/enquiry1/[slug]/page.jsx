import EnquiryForm from "@/components/EnquiryForm";

export default function EnquiryPage({ params }) {
  const { slug } = params;

  return <EnquiryForm slug={slug} />;
}