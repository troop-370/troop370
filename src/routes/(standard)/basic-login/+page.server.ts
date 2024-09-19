import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const data = await request.formData();
    await locals.session.set({
      ...locals.session.data,
      protectedPass: data.get('password')?.toString() || '',
    });

    if (data.get('password') !== PROTECTED_PAGE_PASSWORD) {
      return fail(400, { incorrectPassword: true });
    }

    const from = url.searchParams.get('from');
    if (from) redirect(302, from);
    redirect(302, '/');
  },
};

export const load: PageServerLoad = async ({ parent, url }) => {
  const { session } = await parent();

  if (session.authenticated === true) {
    const from = url.searchParams.get('from');
    if (from) redirect(302, from);
    redirect(302, '/');
  }

  return {};
};
