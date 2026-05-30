import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.122"],
  reactCompiler: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        destination: "/countries/:path*",
        has: [
          {
            type: "host",
            value: "countries.malakwyzz.com",
          },
        ],
        source: "/:path*",
      },
    ];
  },
  turbopack: { root: path.join(__dirname, "..") },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
