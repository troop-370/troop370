/**
 * Converts a camelCase string to dash-case.
 *
 * _Adapted from https://www.cloudhadoop.com/javascript-camel-hyphen/
 */
export function camelToDashCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
