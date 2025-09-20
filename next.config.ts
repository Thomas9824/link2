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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://raw.githubusercontent.com; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
