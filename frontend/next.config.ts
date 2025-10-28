const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: isProd ? '' : '' ,
  assetPrefix: isProd ? '' : '' ,
  
  output: 'standalone',
};

export default nextConfig;
