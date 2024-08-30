/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      // cache for 30 seconds in client side router
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  output: "standalone",
}

export default nextConfig
