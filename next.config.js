/** @type {import('next').NextConfig} */
const isGH = process.env.GITHUB_REPOSITORY || process.env.GITHUB_ACTIONS;
const repo = 'hotel3d'; // ←リポジトリ名に変更

module.exports = {
  output: 'export',            // ← これで export モード
  images: { unoptimized: true }, // 画像最適化を無効化（静的ホスティング向け）
  // GitHub Pages のサブパス配信に対応
  basePath: isGH ? `/${repo}` : '',
  assetPrefix: isGH ? `/${repo}/` : undefined,
  trailingSlash: true,         // 404回避に有利（/path -> /path/）
};