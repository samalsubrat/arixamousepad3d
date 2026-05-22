import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/models/:path*",
        destination: "https://images.arion.in/mousepad-3d-gtlf/:path*",
      },
    ];
  },
};

export default nextConfig;
