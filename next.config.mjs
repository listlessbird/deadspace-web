/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      // cache for 30 seconds in client side router
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"]
};

export default nextConfig;
