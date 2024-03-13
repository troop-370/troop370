import { hasKey } from '$utils/hasKey';

/**
 * Whether the type is a the tuple with the GraphQL type and the mongoose type
 */
function isTypeTuple(toCheck: unknown): toCheck is [GraphSchemaType, MongooseSchemaType] {
  return (
    toCheck !== null &&
    toCheck !== undefined &&
    typeof toCheck === 'object' &&
    Array.isArray(toCheck) &&
    toCheck.length === 2
  );
}

interface SchemaRef {
  /**
   * The collection from which the data for this field comes.
   */
  model: string;
  /**
   * The identifying field on the referenced collection.
   * It must match the `match` field from the current collection.
   */
  by: string;
  /**
   * The identifying field on the current collection.
   * It must match the `by` field from the referenced collection.
   */
  matches: string;
  /**
   * The field from the referenced collection document
   * that contains the value to be used for this field.
   */
  field: string;
  /**
   * The type of the field from the referenced collection.
   * Use the same syntax as the type property defined
   * on the destination field.
   */
  fieldType: SchemaType;
  /**
   * Whether this field can be accessed without authentication.
   */
  public?: boolean;
  /**
   * Configure the column for the table view in the CMS.
   */
  column?: ColumnDef;
}

/**
 * Checks that the input is a schema references instead
 * of an object containing schema definitions.
 */
function isSchemaRef(
  toCheck: SchemaDefType | NestedSchemaDefType | SchemaDef | SchemaRef | [SchemaDefType]
): toCheck is SchemaRef {
  return (
    typeof toCheck === 'object' &&
    !Array.isArray(toCheck) &&
    hasKey(toCheck, 'model') &&
    typeof toCheck.model === 'string' &&
    hasKey(toCheck, 'by') &&
    typeof toCheck.by === 'string' &&
    hasKey(toCheck, 'matches') &&
    typeof toCheck.matches === 'string' &&
    hasKey(toCheck, 'field') &&
    typeof toCheck.field === 'string'
  );
}

interface SchemaDef {
  /**
   * The type of this field.
   *
   * If the type is `'ObjectId'` or `['ObjectId']`, a type type can be provided
   * so that the API knows which collection it references. This allows querying
   * fields in the referenced collection. Otherwise, only the ObjectId is returned.
   *
   * __Examples:__
   *
   * ```
   * // an integer
   * `{ type: 'Int', ...rest }`
   *
   * // an array of strings
   * `{ type: ['String'], ...rest }`
   *
   * // an array of ObjectIds, but not connected to their referenced collection
   * `{ type: ['ObjectId'], ...rest }`
   *
   * // an array of ObjectIds that reference documents in the User collection
   * `{ type: ['[User]', ['ObjectId']], ...rest }`  // note the location of quotation marks
   * ```
   */
  type: SchemaType;
  /**
   * Whether this field is required.
   */
  required?: boolean;
  /**
   * Whether this field must be unique.
   *
   * _This is validated by mongoose._
   */
  unique?: boolean;
  // objects only; whether values not in the schema can be saved to the db
  strict?: boolean;
  /**
   * A default value to use for a new document.
   *
   * If a string is provided, the string value will be used for every new
   * document.
   *
   * If a code specification is provided, a new code will be generated
   * for each new document.
   */
  default?: SchemaDefaultValueType;
  /**
   * Whether this field can be modified.
   */
  modifiable?: boolean;
  /**
   * Whether this field can be accessed without authentication.
   */
  public?: boolean;
  /**
   * Return an error to the client if the new value for this field
   * does not match the provided regular expression.
   */
  rule?: {
    /**
     * A regular expression which the input must match.
     */
    regexp: {
      pattern: string;
      flags: string;
    };
    /**
     * The message to send if the input does not match the regular expression.
     */
    message: string;
  };
  /**
   * Configure the way the field appears in the CMS.
   */
  field?: FieldDef;
  /**
   * Configure the column for the table view in the CMS.
   */
  column?: ColumnDef;
  /**
   * Adds this field to the text search index, which is used for quickly
   * search for text in the collection. Only include string fields.
   *
   * [Read about text indexes.](https://www.mongodb.com/docs/manual/core/link-text-indexes/)
   */
  textSearch?: boolean;
}

interface FieldDef {
  /**
   * Field label.
   */
  label?: string;
  /**
   * Field description.
   */
  description?: string;
  /**
   * Whether the field is read only
   */
  readonly?: boolean;
  /**
   * The order in which this field appears (default: -1)
   */
  order?: number;
  /**
   * Configure this field as a select
   */
  options?: StringOption[] | NumberOption[];
  /**
   * Hide this field.
   *
   * To only show the field in the publish modal, use `'publish-only'`.\
   * To completely hide the field, use `false`.
   */
  hidden?: boolean | 'publish-only';
  /**
   * Displays this field in the collapsed "more fields" section.
   */
  collapsed?: boolean;
  /**
   * Configure this field as a reference to another collection.
   */
  reference?: {
    /**
     * The singular version of the collection name.
     */
    collection?: string;
    /**
     * The fields
     */
    fields?: { _id?: string; name?: string };
    /**
     * Require these fields for the found doc to be selectable.
     */
    require?: string[];
    /**
     * Force these fields to be loaded into the CMS state. This is helpful
     * for forcing fields to be available in the data that is provided to
     * preview URLs. The fields must be available on the collection that
     * is referenced.
     */
    forceLoadFields?: string[];
    /**
     * Filter the query to the collection to exclude non-matching documents
     * with a Strapi filter query
     */
    filter?: any;
  };
  /**
   * Configure tiptap for the field.
   *
   * Only applies to the field with key 'body'.
   */
  tiptap?: TiptapOptions;
  /**
   * Configure field to appear as markdown.
   *
   * Only applies to String types.
   */
  markdown?: boolean;
  /**
   * Use a custom set of fields based on the collection's name.
   *
   * This only works for a parent field type of JSON.
   */
  custom?: Array<{
    /**
     * The name of the document that should use the fields
     * from the `fields` key.
     *
     * Use `"default"` to a provide a default set of fields
     * for when no other match is made.
     */
    name: string;
    /**
     * A set of schema definitions with fields.
     *
     * Each field should represent a key-value pair in the JSON.
     */
    fields: NestedSchemaDefType;
  }>;
}

interface ColumnDef {
  /**
   * Column label.
   */
  label?: string;
  /**
   * The order in which this column appears (default: -1)
   */
  order?: number;
  /**
   * Width of the column in pixels. Defaults to `150`.
   */
  width?: number;
  /**
   * Whether the user can click on the column header to sort the
   * column in ascendiing or descending order.
   *
   * This should only be enabled when the field is a type that
   * can be sorted in a ascending or descending nature. For
   * example, a field with object ids referencing docs in another
   * collection can be sorted, but it may not sort in a way that
   * makes sense to the user because it would sort by id instead
   * of the name field in that document.
   *
   * Defaults to `false`.
   */
  sortable?: boolean;
  /**
   * Display values in this field as chips.
   */
  chips?:
    | boolean
    | {
        value: string | number;
        label?: string;
        color?:
          | 'primary'
          | 'danger'
          | 'success'
          | 'red'
          | 'orange'
          | 'yellow'
          | 'green'
          | 'blue'
          | 'turquoise'
          | 'indigo'
          | 'violet'
          | 'neutral';
      }[];
  /**
   * Hide this column
   */
  hidden?: boolean;
  /**
   * Configure this column as a reference to another collection.
   *
   * This tells
   */
  reference?: {
    /**
     * The singular version of the collection name.
     *
     * If this is not defined, the app will attempt to use
     * the schema type as the collection name.
     */
    collection?: string;
    /**
     * The fields
     */
    fields?: {
      _id?: string;
      name?: string;
    };
  };
}

interface TiptapOptions {
  isHTMLkey?: string;
  layouts?: {
    key: string;
    options: { value: string; label: string }[];
  };
  /**
   * URL to be loaded in an iFrame that can receive document data and present it.
   *
   * This is helpful for previewing the header area of a document so it is
   * possible to see how it will appear once it is published to a website or app.
   *
   * Include the [iframe-resize](https://github.com/davidjbradshaw/iframe-resizer) content window script to allow the frame to
   * automaticallt resize to fit the frame contents.
   */
  metaFrame?: string;
  /**
   * Custom css that will be applied to the editor. It can include nested selectors.
   */
  css?: string;
  /**
   * Fields that should have their value stored as a data attribute
   * on the prosemirror div. The data attribute can be used for
   * providing specific css based on field values.
   *
   * Only fields that have a string or numeric value will be used
   * for data attributes. ObjectId fields will be stingified into their
   * hexadecimal representation.
   */
  pmAttrFields?: string[];
  features: {
    fontFamilies?: {
      name: string;
      label?: string;
      disabled?: boolean;
    }[];
    fontFamilyPicker?: boolean;
    fontSizes?: string[];
    fontSizePicker?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    textStylePicker?: boolean;
    horizontalRule?: boolean;
    widgets?: {
      photoWidget?: boolean;
      sweepwidget?: boolean;
      youtube?: boolean;
    };
    link?: boolean;
    comment?: boolean;
    trackChanges?: boolean;
    pullQuote?: boolean;
    tables?: boolean;
  };
}

type StringOption = { label: string; value: string; disabled?: boolean };
type NumberOption = { label: string; value: number; disabled?: boolean };

type SetterValueType =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | { slugify: string; separator?: string }
  | { code: 'alphanumeric'; length: number };

// allow nesting schema definitions inside objects
type SchemaDefType = {
  [key: string]: SchemaDef | NestedSchemaDefType | SchemaRef | [SchemaDefType];
};
type NestedSchemaDefType = {
  [key: string]: Omit<SchemaDef, 'modifiable'> | NestedSchemaDefType | [NestedSchemaDefType];
};

/**
 * Checks that the input is a schema definition instead
 * of an object containing schema definitions.
 */
function isSchemaDef(
  toCheck: SchemaDefType | NestedSchemaDefType | SchemaDef | SchemaRef | [SchemaDefType]
): toCheck is SchemaDef {
  return typeof toCheck === 'object' && !Array.isArray(toCheck) && hasKey(toCheck, 'type');
}

function isNestedSchemaDefType(
  toCheck: SchemaDefType | NestedSchemaDefType | SchemaDef | SchemaRef | [SchemaDefType]
): toCheck is NestedSchemaDefType {
  const isSchemaDefTypeOrNestedSchemaDefType =
    typeof toCheck === 'object' &&
    !Array.isArray(toCheck) &&
    !isSchemaDef(toCheck) &&
    !isSchemaRef(toCheck);
  if (!isSchemaDefTypeOrNestedSchemaDefType) return false;
  return Object.entries(toCheck).every(
    ([, toCheckSub]) => !Array.isArray(toCheckSub) && !isSchemaRef(toCheckSub)
  );
}

/**
 * Checks that the input is a schema definition instead
 * of an object containing schema definitions.
 */
function isSchemaDefOrType(
  toCheck: SchemaDefType | NestedSchemaDefType | SchemaDef | SchemaRef | [SchemaDefType]
): toCheck is SchemaDefType | NestedSchemaDefType | SchemaDef {
  return typeof toCheck === 'object' && !Array.isArray(toCheck) && !isSchemaRef(toCheck);
}

type SchemaDefaultValueType =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | { code: 'alphanumeric'; length: number };

type SchemaType = MongooseSchemaType | [GraphSchemaType, MongooseSchemaType];

function isCustomGraphSchemaType(toCheck: string): boolean {
  const builtIn = [
    'String',
    'Int',
    'Float',
    'Boolean',
    'ObjectId',
    'Date',
    'JSON',
    '[String]',
    '[Int]',
    '[Float]',
    '[Boolean]',
    '[ObjectId]',
    '[Date]',
    '[JSON]',
  ];

  return !builtIn.includes(toCheck);
}

type GraphSchemaType =
  | 'String'
  | 'Int'
  | 'Float'
  | 'Boolean'
  | 'ObjectId'
  | 'Date'
  | 'JSON'
  | '[String]'
  | '[Int]'
  | '[Float]'
  | '[Boolean]'
  | '[ObjectId]'
  | '[Date]'
  | '[JSON]'
  | '[EncryptedString]'
  | string;

type MongooseSchemaType =
  | 'Boolean'
  | ['Boolean']
  | 'Date'
  | ['Date']
  | 'Number'
  | ['Number']
  | 'Float'
  | ['Float']
  | 'ObjectId'
  | ['ObjectId']
  | 'String'
  | ['String']
  | 'EncryptedString' // is converted to 'String' for mongoose
  | '[EncryptedString]' // is converted to '[String]' for mongoose
  | 'JSON'
  | ['JSON'];

export {
  isCustomGraphSchemaType,
  isNestedSchemaDefType,
  isSchemaDef,
  isSchemaDefOrType,
  isSchemaRef,
  isTypeTuple,
};
export type {
  FieldDef,
  GraphSchemaType,
  MongooseSchemaType,
  NestedSchemaDefType,
  NumberOption,
  SchemaDef,
  SchemaDefType,
  SchemaDefaultValueType,
  SchemaRef,
  SchemaType,
  SetterValueType,
  StringOption,
  TiptapOptions,
};
