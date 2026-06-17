"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideFooter = pathname === "/customization";

  return (
    <>
      <Header />

      <main className="flex-1">
        {children}
      </main>

      {!hideFooter && <Footer />}
    </>
  );
}