import "./globals.css";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export const metadata = {
  title: "Nikita Home Furnishings",
  description:
    "Timeless furniture crafted for modern living. Explore our curated collections of premium home furnishings from Jaipur.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {/* Header is absolutely positioned — floats over hero */}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
