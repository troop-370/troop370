import Root from './header.svelte';

interface NavigationGroup {
  label: string;
  items: NavigationGroupItem[];
  show_in_horizontal_nav?: boolean;
}

interface NavigationGroupItem {
  path: string;
  label: string;
}

export { Root as Header, Root };
export type { NavigationGroup, NavigationGroupItem };
