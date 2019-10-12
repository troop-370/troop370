var APP_PREFIX = "troop370_";
var DATE = "12october2019_"; // update the date and time for every set of pushed commits that one of the cached pages is is updated (or the content will not update on PWAs) (not necessary for changes only to index.html)
var TIME = "1211";

const CACHE = APP_PREFIX + DATE + TIME;
// This is the "Offline page" service worker

const offlineFallbackPage = "/offline.html";

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener("install", function (event) {
  console.log("[Troop 370 Service Worker] Install Event processing");

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[Troop 370 Service Worker] Cached offline page during install");

      if (offlineFallbackPage === "ToDo-replace-this-name.html") {
        return cache.add(new Response("TODO: Update the value of the offlineFallbackPage constant in the serviceworker."));
      }

      return cache.add(offlineFallbackPage);
    })
  );
});

// If any fetch fails, it will show the offline page.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(function (error) {
      // The following validates that the request was for a navigation to a new document
      if (
        event.request.destination !== "document" ||
        event.request.mode !== "navigate"
      ) {
        return;
      }

      console.error("[Troop 370 Service Worker] Network request Failed. Serving offline page " + error);
      return caches.open(CACHE).then(function (cache) {
        return cache.match(offlineFallbackPage);
      });
    })
  );
});

// This is an event that can be fired from your page to tell the SW to update the offline page
self.addEventListener("refreshOffline", function () {
  const offlinePageRequest = new Request(offlineFallbackPage);

  return fetch(offlineFallbackPage).then(function (response) {
    return caches.open(CACHE).then(function (cache) {
      console.log("[Troop 370 Service Worker] Offline page updated from refreshOffline event: " + response.url);
      return cache.put(offlinePageRequest, response);
    });
  });
});
