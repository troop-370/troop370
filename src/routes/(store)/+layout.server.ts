import { apity } from '$api';
import type { NavigationGroup, NavigationGroupItem } from '$components/TopNavigation';
import { notEmpty, parseDoc } from '$utils';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const getRedirects = apity.path('/redirects').method('get').create();
const getNavigation = apity.path('/navigation').method('get').create();

export const load: LayoutServerLoad = async ({ locals }) => {
  // get the redirects
  const { result: redirectsResult } = getRedirects({}, fetch);
  const resolvedRedirects = await redirectsResult;
  if (!resolvedRedirects.ok) error(resolvedRedirects.status, 'server error');
  if (!resolvedRedirects.data.data) error(404, 'redirects not found');
  const redirects = resolvedRedirects.data.data
    .map(parseDoc)
    .filter(notEmpty)
    .map((doc) => {
      return { from: doc.from, to: doc.to, code: 307 };
    });

  // get the navigation config
  const { result: navResult } = getNavigation({ populate: 'nav_groups, nav_groups.items' }, fetch);
  const resolvedNav = await navResult;

  const navConfig = resolvedNav.ok
    ? (resolvedNav?.data?.data?.attributes?.nav_groups?.filter(notEmpty) || [])
        // ensure that only groups that have defined fields and at least one item are returned
        .filter((group): group is NavigationGroup => {
          return (
            !!group.label &&
            group.show_in_horizontal_nav !== undefined &&
            (group.items || [])?.filter((item) => item.label && item.path).length > 0
          );
        })
        // ensure that nav items have a label and path
        .map((group) => {
          return {
            ...group,
            items: group.items.filter(
              (item): item is NavigationGroupItem => !!item.path && !!item.label
            ),
          };
        })
    : [];

  return {
    redirects,
    navConfig,
  };
};

export interface AuthStrings {
  password_message_when_authenticated: string;
}

export interface Redirect {
  from: string;
  to: string;
  code: number;
}
