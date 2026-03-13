import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@hareru/ui', '@hareru/tokens'],
};

const withMDX = createMDX();

export default withMDX(config);
