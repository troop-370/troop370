import { queryWithStore } from '$utils/query';
import { error } from '@sveltejs/kit';
import { isArray, isPlainObject } from 'is-what';
import { merge } from 'merge-anything';
import { derived, get } from 'svelte/store';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch, parent, params }) => {
  const { session, contentManagerSettings, userPermissions } = await parent();
  if (!contentManagerSettings) error(404, 'failed to find content manager settings');

  const contentTypeSettings = derived([contentManagerSettings], ([$contentManagerSettings]) => {
    return $contentManagerSettings.data?.docs?.contentTypes.find((type) => type.uid === params.uid);
  });

  if (!get(contentTypeSettings)) error(404, 'failed to find content type settings');

  if (!userPermissions) error(404, 'failed to find user permissions');
  const permissions = get(userPermissions)?.raw.filter((p) => p.subject === params.uid);
  if (!permissions) error(404, 'failed to find content type permissions');

  const collectionConfig = await queryWithStore<z.infer<typeof collectionConfigurationSchema>>({
    fetch,
    query: {
      location: '/strapi/content-manager/content-types/' + params.uid + '/configuration',
      opName: `strapiContentTypeConfig_${params.uid}`,
      docsPath: 'data',
      paginationPath: '',
    },
    validator: collectionConfigurationSchema,
    Authorization: `Bearer ${session.adminToken}`,
    waitForQuery: true, // ensure that data is available before continuing since we need it in this function
    useCache: true,
    expireCache: 15 * 60 * 1000, // require refetch if it has been 15 minutes
  }).then((store) => {
    return derived([store], ([$store]) => {
      return $store.data?.docs;
    });
  });
  if (!get(collectionConfig)) {
    error(404, 'failed to find collection configuration');
  }

  const combinedSettings = derived(
    [contentManagerSettings, collectionConfig],
    ([$contentManagerSettings, $collectionConfig]) => {
      function calculateDefs(collectionUID: string, isComponent = false) {
        // get settings related to this content type
        const settings = (() => {
          if (isComponent) {
            const componentSettings = $contentManagerSettings.data?.docs?.components.find(
              (type) => type.uid === collectionUID
            );
            if (!componentSettings)
              error(404, 'failed to find component settings for ' + collectionUID);
            return componentSettings;
          }

          return $contentManagerSettings.data?.docs?.contentTypes.find(
            (type) => type.uid === collectionUID
          );
        })();
        if (!settings) error(404, 'failed to find content type settings for ' + collectionUID);

        // get the schema for this content type
        const schema = (() => {
          if (isComponent) {
            const component = $collectionConfig?.components?.[collectionUID];
            if (!component) error(404, 'failed to find component schema for ' + collectionUID);
            return component;
          }

          return $collectionConfig?.contentType;
        })();
        if (!schema) error(404, 'failed to find schema for ' + collectionUID);

        // combine settings from content type and collection config
        const merged = merge(settings, schema);

        // get an array of field names in the order they should appear on the edit page
        const editPageOrderedKeys = merged.layouts.edit.flatMap((layout) =>
          layout.map((field) => field.name)
        );

        const defs = Object.entries(merged.attributes)
          .map(([key, value]) => {
            // the attribute settings should be an object with the type and related settings
            const attribute = isPlainObject(value) ? value : {};

            // if it is a component type, we need to calculate the defs for the component
            if (attribute.type === 'component') {
              const [componentDefs] = calculateDefs(attribute.component as string, true);
              attribute.componentDefs = componentDefs || [];
            }

            // if it is a dynamic zone type, we need to calculate the defs for the component
            if (attribute.type === 'dynamiczone') {
              if (isArray(attribute.components)) {
                const data = attribute.components.map((component) => {
                  const [componentDefs, mergedSettings] = calculateDefs(component as string, true);
                  return {
                    key: component as string,
                    settings: mergedSettings,
                    defs: componentDefs,
                  };
                });

                attribute.componentDefs = Object.fromEntries(
                  data.map((component) => {
                    return [component.key, component.defs] as const;
                  })
                );

                attribute.componentSettings = Object.fromEntries(
                  data.map((component) => {
                    const { attributes, layouts, metadatas, ...rest } = component.settings;
                    return [
                      component.key,
                      { displayName: rest.info.displayName, more: rest },
                    ] as const;
                  })
                );
              }
            }

            // determine the numerical order of this field on the edit page
            const orderIndex = editPageOrderedKeys.findIndex((k) => k === key);

            return [
              key,
              {
                ...attribute,
                ...merged.metadatas[key].edit,
                table: merged.metadatas[key].list,
                order: orderIndex === -1 ? Infinity : orderIndex,
              },
            ] as [string, StrapiAttribute];
          })
          .sort(([, a], [, b]) => (a.order > b.order ? 1 : -1));

        return [defs, merged] as const;
      }

      const [defs, merged] = calculateDefs(params.uid);
      return { ...merged, defs };
    }
  );

  if (!get(combinedSettings)) {
    error(404, 'failed to find combined settings');
  }

  return {
    contentTypeSchema: contentTypeSettings,
    permissions,
    collectionConfig: combinedSettings,
  };
}) satisfies LayoutLoad;

const typeConfigurationSchema = z.object({
  layouts: z.object({
    edit: z
      .object({
        name: z.string(),
        size: z.number(),
      })
      .array()
      .array(),
    list: z.string().array(),
  }),
  metadatas: z.record(
    z.string(),
    z.object({
      edit: z
        .object({
          description: z.string().optional(),
          editable: z.boolean().optional(),
          label: z.string().optional(),
          placeholder: z.string().optional(),
          visible: z.boolean().optional(),
          mainField: z.string().optional(),
        })
        .passthrough(),
      list: z
        .object({
          label: z.string(),
          searchable: z.boolean(),
          sortable: z.boolean(),
        })
        .passthrough(),
    })
  ),
  settings: z.object({
    bulkable: z.boolean(),
    defaultSortBy: z.string(),
    defaultSortOrder: z.string(),
    filterable: z.boolean(),
    mainField: z.string(),
    pageSize: z.number(),
    searchable: z.boolean(),
  }),
});

const collectionConfigurationSchema = z.object({
  contentType: typeConfigurationSchema,
  components: z.record(
    z.string(),
    typeConfigurationSchema.extend({
      category: z.string(),
    })
  ),
});

type EditMetadata = z.infer<
  typeof collectionConfigurationSchema
>['contentType']['metadatas'][string]['edit'];
type ListMetadata = z.infer<
  typeof collectionConfigurationSchema
>['contentType']['metadatas'][string]['list'];

export type SchemaDef = [string, StrapiAttribute];

// Base Attribute
export interface BaseAttribute extends EditMetadata {
  table: ListMetadata;
  order: number;
  required?: boolean;
  unique?: boolean;
  configurable?: boolean;
  default?: unknown;
  private?: boolean;
}

// Union Type: StrapiAttribute
export type StrapiAttribute =
  | StringAttribute
  | TextAttribute
  | RichTextAttribute
  | BlocksAttribute
  | IntegerAttribute
  | BigIntegerAttribute
  | FloatAttribute
  | DecimalAttribute
  | BooleanAttribute
  | DateAttribute
  | TimeAttribute
  | DateTimeAttribute
  | EmailAttribute
  | EnumerationAttribute
  | JSONAttribute
  | MediaAttribute
  | PasswordAttribute
  | RelationAttribute
  | UIDAttribute
  | ComponentAttribute
  | DynamicZoneAttribute;

// Base Attribute
export interface BaseAttribute {
  required?: boolean;
  unique?: boolean;
  configurable?: boolean;
  default?: unknown;
  private?: boolean;
  writable?: boolean;
}

// Attribute: String
export interface StringAttribute extends BaseAttribute {
  type: 'string';
  minLength?: number;
  maxLength?: number;
}

// Attribute: Text
export interface TextAttribute extends BaseAttribute {
  type: 'text';
}

// Attribute: Markdown
export interface RichTextAttribute extends BaseAttribute {
  type: 'richtext';
}

// Attribute: Blocks
export interface BlocksAttribute extends BaseAttribute {
  type: 'blocks';
}

// Attribute: Integer
export interface IntegerAttribute extends BaseAttribute {
  type: 'integer';
}

// Attribute: Big Integer
export interface BigIntegerAttribute extends BaseAttribute {
  type: 'biginteger';
}

// Attribute: Float
export interface FloatAttribute extends BaseAttribute {
  type: 'float';
}

// Attribute: Decimal
export interface DecimalAttribute extends BaseAttribute {
  type: 'decimal';
}

// Attribute: Boolean
export interface BooleanAttribute extends BaseAttribute {
  type: 'boolean';
}

// Attribute: Date
export interface DateAttribute extends BaseAttribute {
  type: 'date';
}

// Attribute: Time
export interface TimeAttribute extends BaseAttribute {
  type: 'time';
}

// Attribute: DateTime
export interface DateTimeAttribute extends BaseAttribute {
  type: 'datetime';
}

// Attribute: Email
export interface EmailAttribute extends BaseAttribute {
  type: 'email';
}

// Attribute: Enumeration
export interface EnumerationAttribute<T = string> extends BaseAttribute {
  type: 'enumeration';
  enum: T[];
}

// Attribute: JSON
export interface JSONAttribute extends BaseAttribute {
  type: 'json';
}

// Attribute: Media
export interface MediaAttribute extends BaseAttribute {
  type: 'media';
  multiple?: boolean;
  allowedTypes?: ('images' | 'videos' | 'files')[];
}

// Attribute: Password
export interface PasswordAttribute extends BaseAttribute {
  type: 'password';
}

// Attribute: Relation
export interface RelationAttribute extends BaseAttribute {
  type: 'relation';
  relation: string; // e.g., 'oneToOne', 'oneToMany', 'manyToOne', etc.
  target: string; // target model
  inversedBy?: string;
  mappedBy?: string;
  /** The field that should be used as the label for this collection */
  mainField?: string;
}

// Attribute: UID
export interface UIDAttribute extends BaseAttribute {
  type: 'uid';
  targetField?: string;
}

// Attribute: Component
export interface ComponentAttribute extends BaseAttribute {
  type: 'component';
  component: string;
  repeatable?: boolean;
  componentDefs?: SchemaDef[];
}

// Attribute: Dynamic Zone
export interface DynamicZoneAttribute extends BaseAttribute {
  type: 'dynamiczone';
  components: string[];
  componentDefs?: Record<string, SchemaDef[]>;
  componentSettings?: Record<string, { displayName: string; more: Record<string, unknown> }>;
}
