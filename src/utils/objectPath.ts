import * as objectPathRaw from 'object-path';

export const objectPath = objectPathRaw.default ?? objectPathRaw;

export const get = objectPath.get;
export const getProperty = objectPath.get;
export const set = objectPath.set;
export const setProperty = objectPath.set;
