import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React strict Mode to prevent double api calls in development
  reactStrictMode: false,

  // Configure Turbopack
  turbopack: {
    root: __dirname, // Indentify the project root
    rules: {
    }
  },

  // Configure TypeScript
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development'
  },

  // Configure ESLint
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development'
  }
};

export default nextConfig;
