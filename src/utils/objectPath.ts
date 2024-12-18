import * as objectPathRaw from 'object-path';

export const objectPath = objectPathRaw.default ?? objectPathRaw;

export const del = objectPath.del;
export const delProperty = objectPath.del;
export const get = objectPath.get;
export const getProperty = objectPath.get;
export const has = objectPath.has;
export const hasProperty = objectPath.has;
export const set = objectPath.set;
export const setProperty = objectPath.set;
