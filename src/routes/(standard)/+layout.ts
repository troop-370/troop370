import { graphql } from '$houdini';

export const _houdini_load = graphql`
  query TenantDetails {
    tenant {
      name
      displayName
    }
    # for top nav
    webConfigPublic(_id: "6372b96c31dbd6ca19bc52ac") {
      name
      config
    }
  }
`;
