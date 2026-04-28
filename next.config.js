/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation during build to prevent SSR issues
  output: 'standalone',
  // Moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: [],
  turbopack: {
    // Set the application root directory to resolve workspace root warning
    root: __dirname
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

module.exports = nextConfig