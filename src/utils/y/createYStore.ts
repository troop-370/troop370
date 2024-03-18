import { getYFields, type GetYFieldsOptions } from '$utils/y/getYFields';
import { YProvider, type YProviderOptions } from '$utils/y/YProvider.js';
import type { HocuspocusProvider } from '@hocuspocus/provider';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { onDestroy, onMount } from 'svelte';
import { derived, get, writable } from 'svelte/store';
import type * as awarenessProtocol from 'y-protocols/awareness';
import type { SignalingConn, WebrtcProvider } from 'y-webrtc';
import type * as Y from 'yjs';
import type { DeconstructedSchemaDefType } from './deconstructSchema';

export function createYStore({
  collection,
  id,
  versionDate,
  user,
  deconstructedSchema,
  providerOpts,
}: UseYProps) {
  const y = new YProvider();

  const docName = versionDate
    ? `troop-370.${collection}.${id.replaceAll('.', '__‾‾')}.${versionDate}`
    : `troop-370.${collection}.${id.replaceAll('.', '__‾‾')}`;

  let mounted = false;
  let ydoc = writable<Y.Doc | null>(null);
  let webProvider = writable<WebrtcProvider | null>(null);
  let wsProvider = writable<HocuspocusProvider | null>(null);
  let awareness = writable<AwarenessUser[] | null>(null);
  let synced = writable(false);
  let connected = writable({ webrtc: false, ws: false });
  let sharedData = writable<Record<string, unknown>>({});
  let fullSharedData = writable<Record<string, unknown>>({});

  async function getData(opts?: GetYFieldsOptions) {
    if (!deconstructedSchema) {
      throw new Error('Cannot get data from shared types without specifying the collection schema');
    }
    const $ydoc = get(ydoc);
    if (!$ydoc) return {};
    const res = await getYFields($ydoc, deconstructedSchema, opts);
    res._id = id;
    return res;
  }

  /**
   * Create the get(ydoc) and the sync providers upon mount
   */
  onMount(() => {
    let mounted = true;
    y.create(docName, user._id, __APP_VERSION__, providerOpts).then((ydata) => {
      if (mounted) {
        ydoc.set(ydata.ydoc);
        webProvider.set(ydata.webProvider);
        wsProvider.set(ydata.wsProvider);

        // create a setting map for this document (used to sync settings accross all editors)
        const settingsMap = get(ydoc)?.getMap<IYSettingsMap>('__settings');
        settingsMap?.set('collection', collection);

        // keep awareness state in sync with awareness values
        ydata.wsProvider.awareness.on('change', () => {
          awareness.set(calcAwareness(ydata.wsProvider.awareness));
        });

        // set local user awareness field with user details
        if (user) {
          // note: the change event is only fired if the serialized user object
          // is different, so it is okay to set this whenever the user object
          // changes (even if the serialized value does not change)
          ydata.wsProvider.awareness.setLocalStateField('user', user);
        }

        // track the sync status
        ydata.wsProvider.on('sync', ({ state }: { state: boolean }) => {
          synced.set(state);
        });

        // track the connection status of the webrtc and websocket providers
        (ydata.webProvider.signalingConns as SignalingConn[])[0]?.on('connect', () => {
          connected.set({
            ...get(connected),
            webrtc: true,
          });
        });
        (ydata.webProvider.signalingConns as SignalingConn[])[0]?.on('disconnect', () => {
          connected.set({
            ...get(connected),
            webrtc: false,
          });
        });
        ydata.wsProvider.on('connect', () => {
          connected.set({
            ...get(connected),
            ws: true,
          });
        });
        ydata.wsProvider.on('disconnect', () => {
          connected.set({
            ...get(connected),
            ws: false,
          });
        });

        // get copies of the data in the shared types every time the ydoc updates
        const handleDocUpdate = AwesomeDebouncePromise(async () => {
          if (deconstructedSchema) {
            const sharedValues = (await getData()) ?? {};
            const sharedValuesInternal =
              (await getData({ retainReferenceObjects: true, keepJsonParsed: true })) ?? {};
            sharedData.set(sharedValues);
            fullSharedData.set(sharedValuesInternal);
          }
        }, 500);
        ydata.ydoc.on('update', handleDocUpdate);
      }
    });
  });

  /**
   * Destroy the provider instance upon destruction of the comonent
   */
  onDestroy(() => {
    y.delete(docName);
    mounted = false;
  });

  return {
    ydoc: derived(ydoc, ($_) => $_),
    webProvider: derived(webProvider, ($_) => $_),
    wsProvider: derived(wsProvider, ($_) => $_),
    awareness: derived(awareness, ($_) => $_),
    synced: derived(synced, ($_) => $_),
    connected: derived(connected, ($_) => $_),
    sharedData: derived(sharedData, ($_) => $_),
    fullSharedData: derived(fullSharedData, ($_) => $_),
    getData,
  };
}

/**
 * Builds an array of objects of type `IAwarenessProfile` with duplicate values
 * from the same session removed from the array.
 */
function calcAwareness(providerAwareness: awarenessProtocol.Awareness) {
  // get all current awareness information and filter it to only include
  // sessions with defined users
  const allAwarenessValues: AwarenessUser[] = Array.from(providerAwareness.getStates().values())
    .filter((value) => value.user)
    .map((value) => value.user);

  // remove duplicate awareness information by only adding objects with
  // unique sessionIds to the array (session ids are create by the app and
  // stored in `sessionStorage`)
  let awareness: AwarenessUser[] = [];
  allAwarenessValues.forEach((value: AwarenessUser) => {
    // check whether session id is unique
    const isUnique =
      awareness.findIndex((session) => session.sessionId === value.sessionId) === -1 ? false : true;

    // only push to final awareness array if the session is unique
    if (!isUnique) {
      awareness.push(value);
    }
  });

  // update in state
  return awareness;
}

interface UseYProps {
  /**
   * The schema name of the collection. NOT the plural name or hypenated name.
   */
  collection: string;
  id: string;
  user: AwarenessUser;
  versionDate?: string;
  deconstructedSchema?: DeconstructedSchemaDefType;
  providerOpts?: YProviderOptions;
}

export type YStore = ReturnType<typeof createYStore>;

interface IYSettingsMap {
  trackChanges?: boolean;
  collection: string;
}

export interface AwarenessUser {
  name: string;
  color: string;
  sessionId: string;
  _id: string;
  photo: string;
  [key: string]: unknown;
}
