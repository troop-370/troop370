var APP_PREFIX = "troop370_";
var DATE = "22may2019_"; // update the date and time for every set of pushed commits that one of the cached pages is is updated (or the content will not update on PWAs) (not necessary for changes only to index.html)
var TIME = "0522";

const CACHE = APP_PREFIX + DATE + TIME;
const precacheFiles = [
  "./index.html",
  "./about.html",
  "./advancement.html",
  "./calendar.html",
  "./campout-schedule-local-events.html",
  "./camps-adventure.html",
  "./communication.html",
  "./contact-webmaster.html",
  "./contact.html",
  "./cookies.html",
  "./css/main.css",
  "./css/main-dark.css",
  "./css/page/campout-schedule-local-events.css",
  "./eagle-scout-honor-roll.html",
  "./faqs.html",
  "./finding-mb.html",
  "./forms-documents.html",
  "./helpful-links.html",
  "./js/crypto-js.min.js",
  "./js/flickity.pkgd.min.js",
  "./js/main.js",
  "./js/topbar.min.js",
  "./leaders.html",
  "./leadership-training.html",
  "./manifest.json",
  "./mb-counselors.html",
  "./offline.html",
  "./participation.html",
  "./payments.html",
  "./photos.html",
  "./recharter.html",
  "./src/fonts/IBM_Plex_Sans_Bold.woff",
  "./src/fonts/IBMPlexSans-Regular.woff2",
  "./src/fonts/IBMPlexSansCondensed-Bold.woff2",
  "./src/370-mountains-dark.jpg",
  "./src/370-mountains-light.jpg",
  "./src/troop370-logo/bugle-logo-512x512.png",
  //./src/troop370-logo/favicon.ico",
  //"./submission-received.html",
  "./troop-roster.html",
  "./what-can-i-do.html",
  "./"
];

const offlineFallbackPage = "./offline.html";

const networkFirstPaths = [
  "./index.html"
];

const avoidCachingPaths = [
  "./eagle-scout-honor-roll.html"
];

function pathComparer(requestUrl, pathRegEx) {
  return requestUrl.match(new RegExp(pathRegEx));
}

function comparePaths(requestUrl, pathsArray) {
  if (requestUrl) {
    for (let index = 0; index < pathsArray.length; index++) {
      const pathRegEx = pathsArray[index];
      if (pathComparer(requestUrl, pathRegEx)) {
        return true;
      }
    }
  }

  return false;
}

self.addEventListener("install", function (event) {
  console.log("[Troop 370 Service Worker] Install event processing");

  console.log("[Troop 370 Service Worker] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[Troop 370 Service Worker] Caching pages during install");

      return cache.addAll(precacheFiles).then(function () {
        if (offlineFallbackPage === "./offline.html")

        return cache.add(offlineFallbackPage);
      });
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
  console.log("[Troop 370 Service Worker] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  if (comparePaths(event.request.url, networkFirstPaths)) {
    networkFirstFetch(event);
  } else {
    cacheFirstFetch(event);
  }
});

function cacheFirstFetch(event) {
  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache so we responde with it and update the entry

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (error) {
            // The following validates that the request was for a navigation to a new document
            if (event.request.destination !== "document" || event.request.mode !== "navigate") {
              return;
            }

            console.log("[Troop 370 Service Worker] Network request failed and no cache." + error);
            // Use the precached offline page as fallback
            return caches.open(CACHE).then(function (cache) {
              cache.match(offlineFallbackPage);
            });
          });
      }
    )
  );
}

function networkFirstFetch(event) {
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));
        return response;
      })
      .catch(function (error) {
        console.log("[Troop 370 Service Worker] Network request Failed. Serving content from cache: " + error);
        return fromCache(event.request);
      })
  );
}

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  if (!comparePaths(request.url, avoidCachingPaths)) {
    return caches.open(CACHE).then(function (cache) {
      return cache.put(request, response);
    });
  }

  return Promise.resolve();
}
