import { apity } from '$api';
import { notEmpty } from '$utils';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getEmailNewsletters = apity.path('/newsletters').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  // redirect to login
  const { session } = await parent();
  if (session.authenticated !== true) {
    throw redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
  }

  // get the newsletters
  const { result } = getEmailNewsletters({}, fetch);
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data) throw error(404, 'not found');

  const docs = resolved.data.data
    .map((d) => d.attributes)
    .filter(notEmpty)
    .map((d) => {
      return {
        _id: d.object_id,
        name: d.name,
        timestamps: {
          published_at: d.publishedAt,
        },
      };
    });

  const pagination = resolved.data.meta?.pagination;
  const page = pagination?.page || parseInt(params.page);

  return {
    newsletters: {
      docs,
      hasNextPage: (pagination?.pageCount || 1) > page,
      hasPrevPage: page > 1,
      page,
    },
  };
};
