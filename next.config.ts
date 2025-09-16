import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Améliorer les performances et la sécurité
    optimizePackageImports: ['lucide-react'],
  },

  // Configuration de sécurité
  poweredByHeader: false, // Masquer le header "X-Powered-By: Next.js"

  // Headers de sécurité supplémentaires
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
