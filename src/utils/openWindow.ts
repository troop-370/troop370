import { slugify } from './slugify';

interface OpenWindowOpts {
  customName?: string;
  width?: number;
  height?: number;
}

export function openWindow(
  url: string | URL,
  target: string,
  features?: string,
  opts?: OpenWindowOpts
) {
  window.open(url, target, features);
  // import('@tauri-apps/api')
  //   .then(async ({ app, invoke }) => {
  //     const isTauriApp = await app
  //       .getVersion()
  //       .then(() => true)
  //       .catch(() => false);

  //     if (isTauriApp) {
  //       // open a new tauri window
  //       invoke('open_window', {
  //         label: slugify(target, '-'),
  //         title: opts?.customName || 'Cristata',
  //         location: url.toString(),
  //         width: opts?.width,
  //         height: opts?.height,
  //       });
  //     } else {
  //       // fall back to the browser-provided window.open command
  //       window.open(url, target, features);
  //     }
  //   })
  //   .catch(() => {
  //     // fall back to the browser-provided window.open command
  //     window.open(url, target, features);
  //   });
}
