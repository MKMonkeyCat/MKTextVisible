import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isLibMode = mode === 'lib';

  if (isLibMode) {
    return {
      build: {
        lib: {
          name: 'MKTextVisible',
          entry: resolve(__dirname, 'src/index.ts'),
          formats: ['es', 'umd', 'iife'],
          fileName: (format) => `mk-text-visible.${format}.js`,
        },
        emptyOutDir: true,
        minify: 'terser',
        cssCodeSplit: false,
        cssMinify: true,
        target: 'es2015',
        reportCompressedSize: true,
      },
    };
  }

  return {
    build: {
      outDir: 'dist-demo',
      emptyOutDir: true,
      minify: 'terser',
      cssMinify: true,
      target: 'es2015',
    },
  };
});
