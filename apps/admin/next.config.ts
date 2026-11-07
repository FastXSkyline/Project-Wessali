import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@wessali/contracts', '@wessali/i18n', '@wessali/design-tokens'],
};

export default nextConfig;
