import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();

    const email = data.get('email')?.toString();
    if (!email) {
      return { error: 'Email is required' };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.email': email,
    }));

    redirect(303, '/pay/pinestraw/checkout/distribution-method');
  },
} satisfies Actions;
