import { writable } from 'svelte/store';

export const title = writable<string | undefined>(undefined);
