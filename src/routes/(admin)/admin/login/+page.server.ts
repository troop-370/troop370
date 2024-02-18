import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { tryCredentials } from './tryCredentials';

export const actions: Actions = {
  default: async ({ request, locals, url, fetch }) => {
    const data = await request.formData();

    if (!data.get('email')) {
      return fail(400, { missingEmail: true });
    }

    if (!data.get('password')) {
      return fail(400, { missingPassword: true });
    }

    const [status, code, credentials] = await tryCredentials(
      fetch,
      data.get('email') || '',
      data.get('password') || ''
    );
    if (status === 400) {
      if (code === 'SERVER_CONNECTION_ERROR') return fail(400, { connectionError: true });
      if (code === 'UNKNOWN_SERVER_ERROR') return fail(400, { unknownServerError: true });
      if (code === 'UNKNOWN_ERROR') return fail(400, { unknownError: true });
    }
    if (status === 401) {
      return fail(401, { incorrectPassword: true });
    }
    if (status === 429) {
      return fail(429, { rateLimit: true });
    }

    await locals.session.set({
      ...locals.session.data,
      adminEmail: data.get('email')?.toString() || '',
      adminPass: data.get('password')?.toString() || '',
      adminToken: credentials?.token,
      adminUser: credentials?.user,
    });

    const from = url.searchParams.get('from');
    if (from) throw redirect(302, from);
    throw redirect(302, '/admin');
  },
};

export const load: PageServerLoad = async ({ parent, url, fetch, locals }) => {
  const { session } = await parent();

  // if the credentials are stored, use them if they are still valid
  if (session && session.adminEmail && session.adminPass) {
    const [status, , credentials] = await tryCredentials(
      fetch,
      session.adminEmail,
      session.adminPass
    );

    await locals.session.set({
      ...locals.session.data,
      adminToken: credentials?.token,
      adminUser: credentials?.user,
    });

    if (status === 200) {
      const from = url.searchParams.get('from');
      if (from) throw redirect(302, from);
      throw redirect(302, '/admin');
    }
  }

  await locals.session.set({
    ...locals.session.data,
    adminEmail: undefined,
    adminPass: undefined,
    adminToken: undefined,
    adminUser: undefined,
  });

  return {};
};
