import { tryCredentials } from '../login/tryCredentials';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
  return {
    setReactInputValue,
    setReactChecked,
    checkCredentials: (email: string, password: string) => tryCredentials(fetch, email, password),
  };
}) satisfies PageLoad;

function setReactInputValue(element: HTMLInputElement, value: string) {
  let lastValue = element.value;
  element.value = value;
  // @ts-expect-error target exists on inputs in react
  const event = new Event('input', { target: element, bubbles: true });
  // @ts-expect-error _valueTracker exists on inputs in react
  const tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  element.dispatchEvent(event);
}

function setReactChecked(element: HTMLInputElement, bool: boolean) {
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set?.call(
    element,
    bool
  );
  const event = new Event('click', { bubbles: true });
  element.dispatchEvent(event);
}
