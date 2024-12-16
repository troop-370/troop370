import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  ssr: {
    // add libraries containing invalid ESM here
    noExternal: ['rrule', 'copy-anything'],
  },
  optimizeDeps: {
    // ensures compatibility with old commonjs libraries
    include: ['youtube-player'],
  },
};

export default config;
