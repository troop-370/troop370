import CSSInliner from 'css-inliner';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const inliner = new CSSInliner({
    directory: 'stylesheets',
  });

  const htmlString = await request.text();

  const inlined = await inliner.inlineCSSAsync(htmlString);

  return new Response(String(inlined));
};
