import "./globals.css";
import { Cormorant_Garamond, Inter } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import AuthProvider from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Nikita Home Furnishings",
  description:
    "Timeless furniture crafted for modern living. Explore our curated collections of premium home furnishings from Jaipur.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full ${cormorant.variable} ${inter.variable}`}>
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