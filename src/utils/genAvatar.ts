import _Avatar from 'boring-avatars';
import _ColorHash from 'color-hash';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;

// @ts-expect-error
const Avatar: typeof _Avatar = _Avatar.default || _Avatar;

const cache = new Map<string, string>();

/**
 * Generate an avatar from a string.
 *
 * _Powered by boringavatars.com_
 *
 * @param id string identifier to be used when generating the avatar and its color scheme
 * @param size width and height of the generated avatart (default: 120)
 * @param type type of avatar (default: beam)
 * @returns
 */
export function genAvatar(
  id: string,
  size = 120,
  type: 'beam' | 'bauhaus' | 'pixel' | 'marble' | 'ring' | 'sunset' = 'beam'
) {
  // @ts-expect-error 'bkdr' is a vlid hash config value
  const colorHash = new ColorHash({ saturation: 0.6, lightness: 0.7, hash: 'bkdr' }); // note that this config is different than the one that picks the user accent color

  const colors = [
    colorHash.hex(id),
    colorHash.hex(id.substr(4, id.length / 2)),
    colorHash.hex(id.substr(id.length / 2, id.length)),
    colorHash.hex(id.split('').reverse().join('')),
  ];

  const key = `${id}-${size}-${type}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const el = createElement(Avatar, {
    name: id + 's',
    size,
    variant: type,
    colors,
    square: true,
  });
  const html = renderToStaticMarkup(el);

  const blob = new Blob([html], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(blob);

  cache.set(key, blobURL);
  console.log('genAvatar', id, blobURL);
  return blobURL;
}
