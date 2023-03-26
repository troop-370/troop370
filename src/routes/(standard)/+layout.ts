import { graphql } from '$houdini';
import { notEmpty } from '$utils';
import { z } from 'zod';
import type { LayoutLoadEvent, _houdini_afterLoadData } from './$houdini';

export const _houdini_load = graphql`
  query TenantDetails {
    tenant {
      name
      displayName
    }
    webConfigPublic(_id: "6372b96c31dbd6ca19bc52ac") {
      name
      config
    }
    redirectsConfig: webConfigPublic(_id: "638533b5f4af56f80775962e") {
      name
      config
    }
  }
`;

export async function _houdini_afterLoad({
  data,
  event,
}: {
  data: _houdini_afterLoadData;
  event: LayoutLoadEvent;
}) {
  if (data.TenantDetails.redirectsConfig?.config) {
    try {
      const redirects = redirectsConfigSchema.parse(
        JSON.parse(data.TenantDetails.redirectsConfig.config)?.redirects || []
      );

      return { ...event.data, redirects: redirects.filter(notEmpty) };
    } catch (error) {
      console.error(error);
    }
  }
  return { ...event.data, redirects: [] };
}

const redirectsConfigSchema = z
  .object({
    from: z.string(),
    to: z.string(),
    code: z.number().optional().nullable(),
  })
  .array();

export type Redirect = z.infer<typeof redirectsConfigSchema>[0];
