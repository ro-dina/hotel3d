/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 画像最適化はデフォルト（true）でOK。外部ドメインを使うなら images.domains を追記。
  images: {
    // unoptimized: false, // ←明示不要（デフォルト最適化ON）
    // domains: ['example.com'], // 必要なら
  },

  // SSR では不要。GitHub Pages（静的）用の設定は削除
  // basePath: '',
  // assetPrefix: undefined,

  // trailingSlash は任意（SSRでは必須ではない）
  // trailingSlash: false,
};

module.exports = nextConfig;