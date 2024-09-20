import adapter from '@sveltejs/adapter-auto';
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
      checkOrigin: process.env.NODE_ENV === 'production',
    },
  },
};

export default config;
