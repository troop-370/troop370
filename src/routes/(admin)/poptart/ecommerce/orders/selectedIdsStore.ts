import { writable } from 'svelte/store';

export const selectedIds = writable<string[]>([]);
