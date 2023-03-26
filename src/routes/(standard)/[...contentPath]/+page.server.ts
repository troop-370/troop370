import { ISR_TOKEN } from '$env/static/private';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
  isr: {
    // Expiration time (in seconds) before the cached asset will be re-generated by invoking the Serverless Function.
    // Setting the value to `false` means it will never expire.
    expiration: false,

    // Random token that can be provided in the URL to bypass the cached version of the asset, by requesting the asset
    // with a __prerender_bypass=<token> cookie.
    //
    // Making a `GET` or `HEAD` request with `x-prerender-revalidate: <token>` will force the asset to be re-validated.
    bypassToken: ISR_TOKEN,

    // List of valid query parameters. Other parameters (such as utm tracking codes) will be ignored,
    // ensuring that they do not result in content being regenerated unnecessarily
    allowQuery: [],
  },
};
