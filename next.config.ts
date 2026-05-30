import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.122"],
  reactCompiler: true,
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          destination: "/countries/$1",
          has: [{ type: "host", value: "countries.malakwyzz.com" }],
          source: "/((?!_next|api|favicon.ico|.*\\..*).*)",
        },
        {
          destination: "/countries",
          has: [{ type: "host", value: "countries.malakwyzz.com" }],
          source: "/",
        },
      ],
    };
  },
  turbopack: { root: path.join(__dirname, "..") },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
