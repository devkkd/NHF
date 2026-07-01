/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket URL
      // Format: https://pub-XXXX.r2.dev
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      // Custom domain if you set one on R2 later
      // { protocol: "https", hostname: "images.nikitahomefurnishings.com" },
    ],
  },
};

export default nextConfig;
