/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pulse/engine', '@pulse/web'],
};

module.exports = nextConfig;

