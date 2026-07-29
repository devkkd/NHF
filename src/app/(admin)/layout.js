import { AdminAuthProvider } from "@/context/AdminAuthContext";
import "@/styles/admin.css";

export const metadata = { title: "Admin — NHF" };

export default function AdminLayout({ children }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
