import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { derived, writable } from 'svelte/store';

// 0 = hidden
// 1 = shown
// 2 = inactive (in selection pane)
export const params = writable(getFromUrl());

export const richTextParams = derived([params], ([$params]) => {
  return {
    ...$params,
    obj: $params,
    activeCount: Object.entries($params).filter(
      ([key, value]) => key !== 'fs' && key !== 'previewMode' && (value === 1 || value === 2 || value === 3)
    ).length,
    primaryActive:
      Object.entries($params).find(
        ([key, value]) => key !== 'fs' && key !== 'previewMode' && value === 1
      )?.[0] ||
      Object.entries($params).find(([key, value]) => key !== 'fs' && key !== 'previewMode' && value === 3)?.[0],
    isActive(key: string) {
      if ($params[key]) return $params[key] === 1 || $params[key] === 2 || $params[key] === 3;
      return false;
    },
    set(key: string, mode: 0 | 1 | 2) {
      params.update(($params) => {
        if (mode === 1) {
          // ensure that multiple params are not a value of one (ignore the fs param)
          const paramsWithoutExtraOnes: typeof $params = Object.fromEntries(
            Object.entries($params).map(([key, value]) => {
              if (key === 'fs') return [key, value];
              if (value === 1) return [key, 2];
              return [key, value];
            })
          );
          return adjustUpdate({ ...paramsWithoutExtraOnes, [key]: mode });
        }

        return adjustUpdate({ ...$params, [key]: mode });
      });
    },
    forceUpdate() {
      params.set(getFromUrl());
    },
  };
});

params.subscribe((richTextParams) => {
  if (!browser) return;
  if (!location) return;

  const url = convertToUrl(richTextParams);
  if (url) goto(url);
});

function adjustUpdate(params: Record<string, 0 | 1 | 2 | 3>) {
  return getFromUrl(convertToUrl(params));
}

function getFromUrl(url?: URL) {
  if (!url && !browser) return {};
  if (!url && !location) return {};

  let obj: Record<string, 0 | 1 | 2 | 3> = {};
  let hasOne = false;
  let hasTwo = false;
  let hasThree = false;
  let firstTwoKey = '';
  let firstThreeKey = '';
  if (!url) url = new URL(location.href);
  [...url.searchParams.entries()].forEach(([key, value]) => {
    const number = value === 'force' ? 3 : parseInt(value);

    if (number === 0) {
      obj[key] = 0;
      return;
    }

    // only allow one param to have a value of one (ignore fs value)
    if (number === 1) {
      if (hasOne) {
        obj[key] = 2;
      } else {
        obj[key] = 1;
      }
      if (key !== 'fs' && key !== 'previewMode') {
        hasOne = true;
      }
    }

    if (number === 2) {
      obj[key] = 2;
      if (key !== 'fs' && key !== 'previewMode') {
        hasTwo = true;
        firstTwoKey = key;
      }
    }

    if (number === 3) {
      obj[key] = 3;
      if (key !== 'fs' && key !== 'previewMode') {
        hasThree = true;
        firstThreeKey = key;
      }
    }
  });

  // if there is no one or three but there are twos, make the first two a one
  if (hasTwo && !hasOne && !hasThree && firstTwoKey) {
    obj[firstTwoKey] = 1;
  }

  return obj;
}

function convertToUrl(params: Record<string, 0 | 1 | 2 | 3>) {
  if (!browser) return;
  if (!location) return;

  const url = new URL(location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (!key) return;
    url.searchParams.set(key, `${value}`);
  });

  return url;
}
