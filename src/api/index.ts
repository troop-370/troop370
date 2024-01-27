export { apity } from './apity';
export type { ApiTypes };
import type { components, operations, paths } from './types';
interface ApiTypes {
  schemas: components['schemas'];
  operations: operations;
  paths: paths;
}
