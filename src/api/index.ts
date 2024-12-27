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
  StandaloneEmail: StandaloneEmail;
}

type ApiNewsletter = ApiTypes['schemas']['Newsletter'];
type ApiPost = ApiTypes['schemas']['Post'] & { body: string };
interface Newsletter extends Omit<Omit<ApiNewsletter, 'version2'>, 'version3'> {
  version3?: {
    pinned_mini_posts?: ApiPost[];
    announcements?: ApiPost[];
    past_announcements?: ApiPost[];
  };
  version2?: {
    pinned_mini_posts?: ApiPost[];
    posts?: ApiPost[];
    fundraiser_mini_posts?: ApiPost[];
    camping_mini_posts?: ApiPost[];
    service_mini_posts?: ApiPost[];
    advancement_mini_posts?: ApiPost[];
    high_adventure_mini_posts?: ApiPost[];
  };
}
type StandaloneEmail = ApiTypes['schemas']['StandaloneEmail'];
