/* eslint-disable node/no-unpublished-import */
import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import createPreset from 'buble-config-rhino';
import type {RollupOptions} from 'rollup';

const config: RollupOptions = {
  external: ['kolmafia', 'philter.util.ash', 'zlib.ash'],
  input: 'src/ocd-test-basic.ts',
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
      tsconfig: 'src/tsconfig.json',
    }),
    buble(createPreset()),
  ],
  treeshake: {
    moduleSideEffects: id => id !== 'philter.util.ash',
  },
};

export default config;
