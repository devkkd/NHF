import "./globals.css";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata = {
  title: "Nikita Home Furnishings",
  description:
    "Timeless furniture crafted for modern living. Explore our curated collections of premium home furnishings from Jaipur.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}