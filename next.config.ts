import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/models/:path*",
        destination:
          "https://arion.blr1.cdn.digitaloceanspaces.com/mousepad-3d-gtlf/:path*",
      },
    ];
  },
};

export default nextConfig;
