/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fallback 'canvas' to false for pdfjs-dist browser builds on Vercel
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
