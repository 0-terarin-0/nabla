import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Next.js Image Optimization API is not supported in static export by default
  // without a custom image loader. Setting unoptimized: true is usually required
  // when using next/image with output: "export".
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
