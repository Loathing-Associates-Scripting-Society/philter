/* eslint-disable node/no-unpublished-import */
import reactRefresh from '@vitejs/plugin-react-refresh';
import del from 'rollup-plugin-delete';
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
      plugins: [
        // Since Blueprint.js 3.0+ uses SVG icons exclusively, we can delete the
        // font icon files
        del({
          force: true,
          hook: 'writeBundle',
          targets: `${OUT_DIR}/assets/icons-*.{woff,eot,ttf}`,
        }),
      ],
    },
    sourcemap: true,
  },
  define: Object.fromEntries(
    Object.entries(process.env).map(([name, value]) => [
      `process.env.${name}`,
      JSON.stringify(value),
    ])
  ),
  plugins: [reactRefresh()],
  server: {
    proxy: {
      // Typical port for KoLmafia's relay browser
      '^/(relay_|images)': 'http://localhost:60080',
    },
  },
});
