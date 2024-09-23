export type NavigateFunction = (to: string, options?: NavigateOptions) => void;

interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
  unstable_flushSync?: boolean;
  unstable_viewTransition?: boolean;
}

type RelativeRoutingType = 'route' | 'path';
