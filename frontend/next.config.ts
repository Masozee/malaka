import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build (temporary - icons migration in progress)
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [],
  // Turbopack configuration for Next.js 16+
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer in development
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
  trailingSlash: false,
  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Temporarily disabled due to critters module issue
    optimizePackageImports: [
      '@hugeicons/react',
      '@hugeicons/core-free-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
      'date-fns',
      'recharts',
    ],
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Compression
  compress: true,
  // Dynamic rendering (disable static generation due to icon migration in progress)
  // output: 'standalone',
};

export default nextConfig;