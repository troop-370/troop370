export { default as BackgroundTable } from './BackgroundTable.svelte';
export { default as CalendarMonth } from './CalendarMonth.svelte';
export { default as CardTable } from './CardTable.svelte';
export { default as ContainerTable } from './ContainerTable.svelte';
export { default as EmailNewsletter2 } from './EmailNewsletter2.svelte';
export { default as HeaderTable } from './HeaderTable.svelte';
export { default as MainTable } from './MainTable.svelte';
export { default as NewsletterMiniPostCard } from './NewsletterMiniPostCard.svelte';
export { default as NewsletterPinnedPostCard } from './NewsletterPinnedPostCard.svelte';
export { default as NewsletterPostCard } from './NewsletterPostCard.svelte';
export { default as ResourceRow } from './ResourceRow.svelte';
export { default as StandaloneEmail2 } from './StandaloneEmail2.svelte';

export function getTableRestProps(restProps: SvelteRestProps) {
  const restPropsEntries = Object.entries(restProps);

  const tableRestProps = Object.fromEntries(
    restPropsEntries
      .filter(([key]) => key.indexOf('table$') === 0)
      .map(([key, value]) => [key.slice(6), value])
  );
  const trRestProps = Object.fromEntries(
    restPropsEntries
      .filter(([key]) => key.indexOf('tr$') === 0)
      .map(([key, value]) => [key.slice(3), value])
  );
  const tdRestProps = Object.fromEntries(
    restPropsEntries
      .filter(([key]) => key.indexOf('td$') === 0)
      .map(([key, value]) => [key.slice(3), value])
  );

  return {
    tableRestProps,
    trRestProps,
    tdRestProps,
  };
}
