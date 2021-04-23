/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/** @type {import("rollup").RollupOptions} */
const config = {
  external: ['kolmafia', 'zlib.ash'],
  input: 'test/e2e/ocd-test-basic.ts',
  output: {
    dir: 'build',
    format: 'cjs',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      outDir: 'build',
      // We don't need source maps because Rhino doesn't support them
      sourceMap: false,
      tsconfig: 'test/e2e/tsconfig.json',
    }),
  ],
};

export default config;
