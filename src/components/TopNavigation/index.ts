export { default as TopNav } from './TopNav.svelte';
export { default as TopNavRow } from './NavRow.svelte';

interface NavigationGroup {
  label: string;
  items: NavigationGroupItem[];
}

interface NavigationGroupItem {
  path: string;
  label: string;
}

export type { NavigationGroup, NavigationGroupItem };
