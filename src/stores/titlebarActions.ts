import { writable } from 'svelte/store';

export const titlebarActions = writable<TitlebarAction[]>([]);

interface TitlebarAction {
  label: string;
  icon: string;
  iconHtml?: string;
  action: ((evt: MouseEvent) => void) | ((evt: MouseEvent) => Promise<void>);
  active?: boolean;
  disabled?: boolean;
  size?: number;
}
