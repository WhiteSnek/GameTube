import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_CLOUDFRONT_URL?.replace(/^https?:\/\//, '') || '',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
