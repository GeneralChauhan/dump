import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost:3000', '192.168.1.42:3000','192.168.1.16:3000','192.168.1.8:3000']
};

export default nextConfig;
