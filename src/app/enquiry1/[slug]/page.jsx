import EnquiryForm from "@/components/EnquiryForm";
import { getProductBySlug } from "@/lib/api";

export default async function EnquiryPage({ params }) {
  // Next.js 15
  const { slug } = await params;

  console.log("Slug:", slug);

  const product = await getProductBySlug(slug);

  console.log("Product:", product);
  console.log("Product JSON:", JSON.stringify(product, null, 2));

  if (!product) {
    return (
      <div
        style={{
          padding: "80px",
          textAlign: "center",
          fontSize: "20px",
          color: "red",
        }}
      >
        Product not found
      </div>
    );
  }

  return (
    <EnquiryForm
      slug={slug}
      product={product}
    />
  );
}