const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: isProd ? '/33zu' : '' ,
  assetPrefix: isProd ? '/33zu/' : '' ,
  
  output: 'standalone',
  trailingSlash: true,
};

export default nextConfig;
