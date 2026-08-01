import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import AuthProvider from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script";

export const metadata = {
  title: "Nikita Home Furnishings",
  description:
    "Timeless furniture crafted for modern living. Explore our curated collections of premium home furnishings from Jaipur.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </GoogleOAuthProvider>
        <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="beforeInteractive"
/>
      </body>
    </html>
  );
}