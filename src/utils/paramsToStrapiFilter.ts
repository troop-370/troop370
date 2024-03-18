import { isJSON } from './isJSON';

export function paramsToStrapiFilter(search: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    // each 'entry' is a [key, value] tuple
    if (!key.startsWith('__')) {
      if (value.startsWith('"') && value.endsWith('"')) result[key] = value.slice(1, -1);
      else if (isJSON(value)) result[key] = JSON.parse(value);
      else result[key] = value;
    }
  }
  return result;
}
