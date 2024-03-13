import { genAvatar } from '$utils';
import _ColorHash from 'color-hash';

import type { LayoutLoad } from './$types';

// @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;
// @ts-expect-error 'bkdr' is a vlid hash config value
const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.34, hash: 'bkdr' });

export const load = (async ({ parent }) => {
  const { session } = await parent();

  // create a user object for the current user (for yjs)
  const yuser = {
    name: session.adminUser?.firstname + '' + session.adminUser?.lastname,
    color: colorHash.hex(`${session.adminUser?.id || session.adminEmail}`),
    sessionId: '',
    _id: `${session.adminUser?.id || session.adminEmail}`,
    photo: genAvatar(`${session.adminUser?.id || session.adminEmail}`),
  };

  return { yuser };
}) satisfies LayoutLoad;

export interface Action {
  id: string;
  label: string;
  icon?: string;
  action: (evt: MouseEvent | TouchEvent | KeyboardEvent | CustomEvent<any>) => void | Promise<void>;
  loading?: boolean;
  onAuxClick?: (evt: MouseEvent | CustomEvent<any>) => void;
  disabled?: boolean;
  tooltip?: string;
  hint?: string;
  // showChevron?: boolean;
}
