import { browser } from '$app/environment';
import { notEmpty, query } from '$utils';
import { getProperty } from '$utils/objectPath';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { z } from 'zod';
import type { Option } from '.';

interface GetReferenceOptions {
  /**
   * The collection UID of the document that will receive the references.
   */
  collectionUid: string;
  targetCollectionUid: string;
  /**
   * The id (name) of the field that will receive the references.
   */
  fieldId: string;
  /**
   * The id of the current document that will receive the references.
   */
  entityId: number;
  /**
   * How many options to load at once.
   * @default 10
   */
  pageSize?: number;
  /**
   * Always load reference documents with these ids.
   */
  idsToInclude?: number[];
  /**
   * Do not load reference documents with these ids.
   */
  idsToExclude?: number[];
  /**
   * The Bearer auth token to use for the request.
   */
  token: string | undefined;
  /**
   * These field names need to be present and truthy in the option
   * for it to be selectable
   *
   * *This will cause additional fetches to confirm the value of these fields*
   */
  requiredFieldNames?: string[];
  /**
   * The field to use as the label for the option.
   */
  mainField: string;
  /**
   * If true, the search will be executed immediately
   * instead of requiring the user to type something first.
   * @default false
   */
  searchImmediately?: boolean;
}

function getReferenceOptions(referenceOpts: GetReferenceOptions | undefined) {
  const searchValue = writable('');
  const options = writable<Option[]>([]);
  const loading = writable(false);
  const error = writable('');

  // return early if reference options are not provided
  if (!referenceOpts) {
    return { searchValue, options, loading, error };
  }

  const {
    collectionUid,
    fieldId,
    entityId,
    idsToInclude,
    idsToExclude,
    token,
    requiredFieldNames,
    mainField,
    pageSize = 10,
    searchImmediately = false,
  } = referenceOpts;

  onMount(() => {
    if (searchImmediately) {
      searchValue.set('');
    }
  });

  // re-query the data when the search string changes
  let controller = new AbortController();
  searchValue.subscribe((newSearchValue) => {
    error.set('');

    // abort observors for the last abort controller and create a new one
    // so that there will never multiples of this query running at once
    controller.abort();
    controller = new AbortController();

    // we only want to execute the query if the search value is not empty
    if (newSearchValue || (browser && searchImmediately)) {
      // mark it as loading and clear the existing values
      // so the select knows to tell the user that it is
      // currently loading
      loading.set(true);
      options.set([]);

      // create an abortable query to the collection
      // that allows us to listen for when a response
      // arrives or cancel a response before it arrives
      const referenceOptionSchema = z.object({
        id: z.number(),
        [mainField]: z.coerce.string().optional(),
      });
      query<z.infer<typeof referenceOptionSchema>[]>({
        fetch,
        signal: controller.signal,
        query: {
          location: '/admin/strapi/content-manager/relations/' + collectionUid + '/' + fieldId,
          opName: 'getReferencOptions',
          paginationPath: 'pagination',
          docsPath: 'results',
        },
        variables: {
          entityId: entityId ? `${entityId}` : undefined,
          pageSize,
          idsToInclude,
          idsToOmit: idsToExclude,
          _q: newSearchValue,
          _filter: '$containsi',
          page: 1,
        },
        Authorization: `Bearer ${token}`,
        validator: referenceOptionSchema.array(),
        useCache: false,
      }).then((res) => {
        // TODO: handle errors

        // the resulting docs can be used as the options for the reference
        let foundOptions = res?.data?.docs?.filter(notEmpty).map((option): Option => {
          return {
            _id: `${option.id}` || '',
            label: `${option[mainField]}` || `${option.id}` || '',
          };
        });
        if (!foundOptions) throw new Error('No reference docs array found');

        // for each option, confirm that it has the required fields
        // and disable the option if it is missing a required field
        foundOptions.forEach((option) => {
          // find the names of the fields that have falsy values
          const falsyFieldNames =
            requiredFieldNames?.filter(
              (requiredFieldName) => !getProperty(option, requiredFieldName)
            ) || [];

          // if the option is missing some fields,
          // disable the option so it cannot be selected
          // and provide a reason so the user knows
          // why the option is disabled
          if (falsyFieldNames.length > 0) {
            option.disabled = true;
            option.reason = `This document cannot be selected because it is missing the following required fields: ${falsyFieldNames.join(
              ', '
            )}`;
          }
        });

        // set the options and present them to the user
        options.set(foundOptions);
        loading.set(false);
      });
    } else {
      loading.set(false);
    }
  });

  return { searchValue, options, loading, error };
}

export { getReferenceOptions };
export type { GetReferenceOptions };
