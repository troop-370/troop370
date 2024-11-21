import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is 'create' | 'clone' => {
  return param === 'create' || param === 'clone';
}) satisfies ParamMatcher;
