/**
 * Converts a string with spaces and other special characters to a slug.
 *
 * _Adapted from codeguy's gist at https://gist.github.com/codeguy/6684588_
 */
export function slugify(str: string, replacement = '-'): string {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaeeeeiiiioooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, replacement) // collapse whitespace and replace by -
    .replace(new RegExp(`[${replacement}]+`, 'g'), replacement); // collapse replacement

  return str;
}
