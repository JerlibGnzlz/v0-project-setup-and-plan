/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forzar regeneración en cada build para evitar problemas de caché
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Desactivar caché de imágenes en desarrollo para ver cambios inmediatos
  images: {
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: false,
    }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  // Configuración para Turbopack (Next.js 16+)
  turbopack: {
    // Configuración vacía para usar Turbopack por defecto
  },
  // Mantener webpack solo para compatibilidad si es necesario
  webpack: (config, { isServer }) => {
    // Prevenir que axios intente usar XMLHttpRequest en el servidor
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        xhr: false,
      }
    }
    return config
  },
}

export default nextConfig
