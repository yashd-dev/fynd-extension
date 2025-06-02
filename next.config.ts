import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.pixelbin.io',
      // Add any other image domains you use here
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
