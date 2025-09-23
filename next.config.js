/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode to prevent double API calls in development
  reactStrictMode: false,
  
  // Configure experimental features
  experimental: {
    // Enable turbopack for faster builds
    turbo: {
      rules: {}
    }
  },

  // Configure TypeScript
  typescript: {
    // Don't fail build on type errors in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development'
  },

  // Configure ESLint
  eslint: {
    // Don't fail build on ESLint errors in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development'
  }
};

module.exports = nextConfig;
