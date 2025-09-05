import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/admin/users",
        destination: "/dashboard/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
