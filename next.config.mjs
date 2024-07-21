/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      // cache for 30 seconds in client side router
      dynamic: 30,
    },
  },
};

export default nextConfig;
