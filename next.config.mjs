/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 纯静态托管（如 Cloudflare Pages）时设置 NEXT_OUTPUT=export，产物输出到 out/
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  // 允许预览实例使用独立的构建目录，避免与本地开发服务器共用 .next 时互相覆盖
  distDir: process.env.NEXT_DIST_DIR || '.next'
}

export default nextConfig
