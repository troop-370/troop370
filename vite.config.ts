import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  ssr: {
    // add libraries containing invalid ESM here
    noExternal: ['rrule'],
  },
};

export default config;
