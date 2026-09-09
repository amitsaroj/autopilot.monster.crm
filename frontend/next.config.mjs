/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ['reactflow'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'cdn.autopilots.monster' }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/.well-known/llms.txt',
        headers: [
          { key: 'Content-Type', value: 'text/markdown; charset=utf-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' }
        ]
      },
      {
        source: '/openapi.json',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' }
        ]
      }
      ,
      {
        source: '/.well-known/mcp',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' }
        ]
      },
      {
        source: '/.well-known/protected-resource.json',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' }
        ]
      }
    ];
  },
};

export default nextConfig;
