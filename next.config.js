/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Replace serverComponentsExternalPackages with serverExternalPackages
  serverExternalPackages: [
    'bcryptjs',
    'jsonwebtoken'
    // Add other packages that need to be external
  ],
  
  webpack: (config, { isServer, dev }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      }
    }
    return config
  }
}

module.exports = nextConfig

