import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE_ISO__: JSON.stringify(new Date().toISOString),
  },
  ssr: {
    // add libraries containing invalid ESM here
    noExternal: ['rrule', 'copy-anything'],
  },
  optimizeDeps: {
    exclude: ['svelte-slate'],
  },
};

export default config;
