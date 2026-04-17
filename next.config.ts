import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't.alcy.cc',
      },
      {
        protocol: 'https',
        hostname: 'www.loliapi.com',
      },
    ],
  },
};

export default nextConfig;
