import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      $utils: './src/utils',
      $stores: './src/stores',
      $components: './src/components',
      $pm: './src/pm',
      $api: './src/api',
    },
    csrf: {
      // TODO: disable this once we are not using Ecwid
      checkOrigin: false,
    },
  },
};

export default config;
