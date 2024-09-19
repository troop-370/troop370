import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ parent, url }) => {
  const { session } = await parent();

  // redirect if there is no access token
  if (!session.ccToken) {
    redirect(302, `/email/auth?from=${encodeURIComponent(url.href)}`);
  }

  // redirect if access token expired
  if (!session.ccTokenExpires || new Date(session.ccTokenExpires) < new Date()) {
    redirect(302, `/email/auth?from=${encodeURIComponent(url.href)}`);
  }
};
