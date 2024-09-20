/// <reference types="svelte" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  interface Locals {
    session: import('svelte-kit-cookie-session').Session<Partial<SessionData>>;
  }

  // interface Platform {}

  // interface PrivateEnv {}

  // interface PublicEnv {}
}

interface SessionData {
  adminEmail: string;
  adminPass: string;
  adminToken: string;
  adminUser: import('./routes/(admin)/admin/login/tryCredentials').PartialUserData;
  admin: Partial<{
    ecwidActive: boolean;
  }>;
  authenticated: boolean;
  protectedPass: string;
  ccToken: string;
  ccTokenExpires: Date;
  counter: number;
  authStrings: Partial<{
    password_message_when_authenticated: string;
  }>;
  'checkout.venmo.referenceTransactionId': string;
  'checkout.venmo.returnUrl': string;
}

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    compactMode: boolean;
    noWrap: boolean;
  }
}
