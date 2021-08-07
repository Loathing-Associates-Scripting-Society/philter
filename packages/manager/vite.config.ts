/* eslint-disable node/no-unpublished-import */
import reactRefresh from '@vitejs/plugin-react-refresh';
import {defineConfig} from 'vite';
// Import @philter/common using a relative path. This is a hack, btw.
// File extension is required to make this work in Node.js v12 AND v14.
import {RELAY_DIR, RELAY_HTML_FILE} from '../common/build/src/index.js';

/** Directory to emit bundle */
const OUT_DIR = `../../release/relay${RELAY_DIR}`;

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    brotliSize: false,
    emptyOutDir: true,
    outDir: OUT_DIR,
    rollupOptions: {
      input: `./${RELAY_HTML_FILE}`,
      output: {
        // Do not include chunk hash in bundle file names, as it introduces a
        // lot of churn whenever the file changes.
        assetFileNames: 'assets/[name][extname]',
        // The 'philter-manager' prefix is intented to avoid file name conflicts
        // with other KoLmafia projects. Although this may be no longer
        // necessary since r20743, we should keep it around for people using old
        // versions of KoLmafia.
        // For more info, see:
        // - https://kolmafia.us/threads/svn-update-does-not-move-files-in-local-copy.26043/post-162344
        // - https://kolmafia.us/threads/cargo-shorts-gui.25416/post-162271
        chunkFileNames: 'assets/philter-manager.[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
    sourcemap: true,
  },
  define: Object.fromEntries(
    Object.entries(process.env)
      // Exclude environment variables that are not valid JavaScript identifiers
      // (we ignore names with non-ASCII characters for practical purposes)
      .filter(([name]) => /[_$a-zA-Z][_$\w]*$/.test(name))
      .map(([name, value]) => [`process.env.${name}`, JSON.stringify(value)])
  ),
  plugins: [reactRefresh()],
  server: {
    open: '/philter-manager.index.html',
    proxy: {
      // Typical port for KoLmafia's relay browser
      '^/(relay_|images)': 'http://localhost:60080',
    },
  },
});
