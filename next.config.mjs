/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许预览实例使用独立的构建目录，避免与本地开发服务器共用 .next 时互相覆盖
  distDir: process.env.NEXT_DIST_DIR || '.next'
}

export default nextConfig
