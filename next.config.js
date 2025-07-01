/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  serverExternalPackages: ['stripe', 'better-auth'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'better-auth': 'commonjs better-auth',
        '@stripe/stripe-js': 'commonjs @stripe/stripe-js',
      });
    }
    return config;
  },
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
