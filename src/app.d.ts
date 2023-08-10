// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  interface Locals {
    session: import('svelte-kit-cookie-session').Session<SessionData>;
  }

  interface Metadata {
    headers?: Record<string, string>;
    token?: string;
  }

  // interface Platform {}

  // interface PrivateEnv {}

  // interface PublicEnv {}
}
