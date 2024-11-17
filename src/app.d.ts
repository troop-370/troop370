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
  adminUser: import('./routes/(admin)/poptart/login/tryCredentials').PartialUserData;
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

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}
