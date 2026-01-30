/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure proper build output
  output: undefined,
  // Enable standalone output for Docker deployments (optional)
  // output: 'standalone',
}

module.exports = nextConfig
