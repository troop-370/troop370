import { redirect } from '@sveltejs/kit';
import { updateBreadcrumbs } from '../../../updateBreadcrumbs';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
  await updateBreadcrumbs(locals.session, {
    label: 'Payment method',
    href: url.pathname,
  });

  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals, url }) => {
    const data = Object.fromEntries((await request.formData()).entries());

    if (!data.payment_method) {
      return { error: 'Payment method is required', data };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.payment_method': data.payment_method.toString(),
    }));

    redirect(303, url.pathname + '/' + data.payment_method.toString());
  },
} satisfies Actions;