import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-grid-layout'],
  banner: { js: '"use client";' },
  onSuccess:
    'node scripts/bundle-css.mjs && node scripts/generate-registry.mjs && node scripts/verify-css-bundle.mjs',
});
