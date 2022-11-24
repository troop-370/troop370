import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import { invalid, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const data = await request.formData();
    await locals.session.set({ ...locals.session.data, protectedPass: data.get('password') || '' });

    if (data.get('password') !== PROTECTED_PAGE_PASSWORD) {
      return invalid(400, { incorrectPassword: true });
    }

    const from = url.searchParams.get('from');
    if (from) throw redirect(302, from);
    throw redirect(302, '/');
  },
};
