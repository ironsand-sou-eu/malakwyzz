import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.122"],
  reactCompiler: true,
  reactStrictMode: true,
  turbopack: { root: path.join(__dirname, "..") },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
