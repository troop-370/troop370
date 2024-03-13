import { HocuspocusProvider } from '@hocuspocus/provider';
import { v4 as uuidv4 } from 'uuid';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

class YProvider {
  #ydocs: Record<string, Y.Doc> = {};
  #webProviders: Record<string, WebrtcProvider> = {};
  #wsProviders: Record<string, HocuspocusProvider> = {};

  async create(name: string, _id: string, appVersion: string, opts?: YProviderOptions) {
    if (!this.has(name)) {
      // create a new Y document
      const ydoc = new Y.Doc();
      this.#ydocs[name] = ydoc;

      // register with a Hocuspocus server provider
      const wsProvider = new HocuspocusProvider({
        url: `${import.meta.env.VITE_WS_PROTOCOL}//${import.meta.env.VITE_HOCUSPOCUS_BASE_URL}`,
        name,
        document: ydoc,
        parameters: { _id, appVersion },
        onDisconnect() {
          // reconnect on disconnect
          wsProvider.shouldConnect = true;
        },
        connect: opts?.noWebsocketConn ? false : true,
        maxAttempts: 0, // never stop trying to reconnect
      });
      this.#wsProviders[name] = wsProvider;

      // register with a WebRTC provider
      const providerOptions = {
        awareness: wsProvider.awareness,
        password: name + 'cristata-development' + __APP_VERSION__,
        signaling: ['wss://y-webrtc-eu.fly.dev'],
      };
      if (import.meta.env.NODE_ENV === 'production') {
        providerOptions.password = (
          await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(name))
        ).toString();
      }
      if (opts?.noWebRtcConn) {
        // use a unique uuid as the passsword so nobody else will have the same password
        providerOptions.password = uuidv4();
      }
      // @ts-expect-error all properties are actually optional
      const webProvider = new WebrtcProvider(name, ydoc, providerOptions);
      this.#webProviders[name] = webProvider;
    }

    return this.get(name);
  }

  get(name: string) {
    const ydoc = this.#ydocs[name];
    const webProvider = this.#webProviders[name];
    const wsProvider = this.#wsProviders[name];

    return { ydoc, webProvider, wsProvider };
  }

  has(name: string): boolean {
    return !!Object.keys(this.#ydocs).find((key) => key === name);
  }

  delete(name: string): void {
    if (this.has(name)) {
      this.#ydocs[name].destroy();
      delete this.#ydocs[name];
      this.#webProviders[name].destroy();
      delete this.#webProviders[name];
      this.#wsProviders[name].destroy();
      delete this.#wsProviders[name];
    }
  }
}

interface YProviderOptions {
  noWebsocketConn?: boolean;
  noWebRtcConn?: boolean;
}

export { YProvider };
export type { YProviderOptions };
