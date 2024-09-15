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
  'store.pinestraw.checkout.email'?: string;
  'store.pinestraw.checkout.orderId'?: string;
  'store.pinestraw.checkout.conf1'?: string;
  'store.pinestraw.checkout.conf2'?: string;
  'store.pinestraw.checkout.conf3'?: string;
  'store.pinestraw.checkout.name'?: string;
  'store.pinestraw.checkout.billing.name'?: string;
  'store.pinestraw.checkout.phone'?: string;
  'store.pinestraw.checkout.billing.phone'?: string;
  'store.pinestraw.checkout.payment_method'?: string;
  'store.pinestraw.checkout.bale_quantity'?: string;
  'store.pinestraw.checkout.spread_quantity'?: string;
  'store.pinestraw.checkout.shipping_method'?: string;
  'store.pinestraw.checkout.street_address'?: string;
  'store.pinestraw.checkout.billing.street_address'?: string;
  'store.pinestraw.checkout.city'?: string;
  'store.pinestraw.checkout.billing.city'?: string;
  'store.pinestraw.checkout.postal_code'?: string;
  'store.pinestraw.checkout.billing.postal_code'?: string;
  'store.pinestraw.checkout.state'?: string;
  'store.pinestraw.checkout.billing.state'?: string;
  'store.pinestraw.checkout.deliver_location'?: string;
  'store.pinestraw.checkout.spread_location'?: string;
  'store.pinestraw.checkout.special_instructions'?: string;
}

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    compactMode: boolean;
    noWrap: boolean;
  }
}
