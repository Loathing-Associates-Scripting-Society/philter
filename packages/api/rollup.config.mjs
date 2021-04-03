/**
 * @file Rollup configuration for building OCD-Cleanup's relay API script
 * (Written in JavaScript to avoid an extra compilation step)
 *
 * This script imports build constants from @ocd-cleanup/common, which is a
 * native ESM package.
 * Unfortunately, Rollup attempts to transpile this config file from ESM to CJS.
 * This causes Node.js to fail, because the transpiled (now CJS) config file
 * attempts to require() @ocd-cleanup/common (ESM)--which is impossible.
 *
 * The solution is to prevent Rollup from transpiling this config file before
 * passing it to Node.js. As of Rollup v2.44.0, the only way to do so is to:
 *
 * 1. Use Node.js >= 13, and...
 * 2. Use the `.mjs` file extension for the config file.
 *    This is not great because TypeScript's compiler refuses to type-check .mjs
 *    files, meaning that we cannot automate type checks for our build config.
 *    Thankfully, VS Code still type-checks .mjs files.
 *
 * (See: https://rollupjs.org/guide/en/#using-untranspiled-config-files)
 */

/* eslint-disable node/no-unpublished-import */
import {RELAY_SCRIPT_FILE} from '@ocd-cleanup/common';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

/** @type {import('rollup').RollupOptions} */
const config = {
  external: ['kolmafia', 'ocd-cleanup.ash', 'ocd-cleanup.util.ash', 'zlib.ash'],
  input: 'src/index.ts',
  output: {
    // To take advantage of TypeScript's incremental build mode, we must allow
    // Rollup to emit to a build directory, then copy the bundled script
    dir: 'build',
    format: 'cjs',
  },
  plugins: [
    nodeResolve(),
    typescript({
      // Don't generate type definitions
      declaration: false,
      // Don't generate source maps (Rhino doesn't support them anyway)
      sourceMap: false,
      tsconfig: 'src/tsconfig.json',
    }),
    copy({
      targets: [
        {
          src: 'build/index.js',
          dest: '../../release/relay',
          rename: RELAY_SCRIPT_FILE,
        },
      ],
    }),
  ],
};

export default config;
