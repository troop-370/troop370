/**
 * Whether a string is valid JSON.
 */
export function isJSON(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}
