import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [houdini(), sveltekit()],
  ssr: {
    // add libraries containing invalid ESM here
    noExternal: ['rrule'],
  },
};

export default config;
