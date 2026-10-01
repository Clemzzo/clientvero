import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: {
    position: "bottom-right",
  },
  redirects() {
    return [{ source: "/app/:path*", destination: "/dashboard/:path*", permanent: false }];
  },
};

export default nextConfig;
