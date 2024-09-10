import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, route, locals }) => {
  const { session } = await parent();

  // throw error unless there is access to ecommerce routes
  const userRoles = session.adminUser?.roles?.map((role) => role.name);
  if (!userRoles) error(403);
  if (!userRoles.includes('Super Admin') && !userRoles.includes('Store Manager')) error(403);

  // handle case where ecwid api is not active because
  // we do not have the premium plan
  if (route.id !== '/(admin)/poptart/ecommerce/unavailable' && !session.admin?.ecwidActive) {
    const potentialError = await fetch(
      `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/application`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return {
          errorCode: data.errorCode,
          errorMessage: data.errorMessage,
        };
      });

    if (potentialError?.errorCode) {
      redirect(307, `/poptart/ecommerce/unavailable?data=${JSON.stringify(potentialError)}`);
    } else {
      await locals.session.set({
        ...locals.session.data,
        admin: { ...locals.session.data.admin, ecwidActive: true },
      });
    }
  }

  if (route.id === '/(admin)/poptart/ecommerce/unavailable') {
    await locals.session.set({
      ...locals.session.data,
      admin: { ...locals.session.data.admin, ecwidActive: false },
    });
  }

  return {};
}) satisfies LayoutServerLoad;
