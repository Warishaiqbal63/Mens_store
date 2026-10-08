import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the dev server to work when the site is opened by localhost or by any home-network IP
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
