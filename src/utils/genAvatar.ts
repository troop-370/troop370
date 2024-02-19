import _ColorHash from 'color-hash';

// @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;

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

  return `https://source.boringavatars.com/${type}/${size}/${id}?colors=${colors
    .toString()
    .replaceAll('#', '')}&square`;
}
