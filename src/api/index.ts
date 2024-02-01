export { apity } from './apity';
export type { ApiTypes };
import type { Node as BlocksNode } from 'blocks-html-renderer';
import type { components, operations, paths } from './types';
interface ApiTypes {
  schemas: components['schemas'];
  operations: operations;
  paths: paths;
  manualSchemas: manualSchemas;
}

interface manualSchemas {
  Newsletter: Newsletter;
}

type ApiNewsletter = ApiTypes['schemas']['Newsletter'];
type ApiPost = ApiTypes['schemas']['Post'] & { body: BlocksNode[] };
export interface Newsletter extends Omit<Omit<ApiNewsletter, 'version2'>, 'version3'> {
  version3?: {
    pinned_mini_posts: { data?: { id?: number; attributes?: ApiPost }[] };
    announcements: { data?: { id?: number; attributes?: ApiPost }[] };
    past_announcements: { data?: { id?: number; attributes?: ApiPost }[] };
  };
  version2?: {
    pinned_mini_posts?: { data?: { id?: number; attributes?: ApiPost }[] };
    posts?: { data?: { id?: number; attributes?: ApiPost }[] };
    fundraiser_mini_posts?: { data?: { id?: number; attributes?: ApiPost }[] };
    camping_mini_posts?: { data?: { id?: number; attributes?: ApiPost }[] };
    service_mini_posts?: { data?: { id?: number; attributes?: ApiPost }[] };
    advancement_mini_posts?: { data?: { id?: number; attributes?: ApiPost }[] };
    high_adventure_mini_posts?: { data?: { id?: number; attributes?: ApiPost }[] };
  };
}
