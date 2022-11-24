export { default as TopNavDrawer } from './NavDrawer.svelte';
export { default as TopNavRow } from './NavRow.svelte';
export { default as TopNav } from './TopNav.svelte';
export type { NavigationGroup, NavigationGroupItem };

interface NavigationGroup {
  label: string;
  items: NavigationGroupItem[];
}

interface NavigationGroupItem {
  path: string;
  label: string;
}
