"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const hideFooter = pathname === "/customization";

  if (isAdmin) {
    return <>{children}</>;
  }

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