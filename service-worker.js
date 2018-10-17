var APP_PREFIX = 'troop370_'
var VERSION = 'version_01' // v.3 includes contribution from @mathias expanding event target to entire page
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [
  '/troop370/styles/components.css',
  '/troop370/styles/page-specific.css',
  '/troop370/styles/troop370-topnav.css',
  '/troop370/resources/materialize/0.97.8/css/materialize.css',
  '/troop370/resources/flickity/flickity.css',
  'https://npmcdn.com/flickity@2/dist/flickity.css',
  '/troop370/resources/flickity/flickity.pkgd.js',
  '/troop370/scripts/insert-header-footer.js',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  '/troop370/index.html#home?utm_source=homescreen',
  '/troop370/index.html#html',
  '/troop370/index.html',
  '/troop370/about.html',
  '/troop370/advancement.html',
  '/troop370/campout-schedule-local-events.html',
  '/troop370/manifest.json',
  '/troop370/src/icons/meeting icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.8/js/materialize.js',
  'https://npmcdn.com/flickity@2/dist/flickity.pkgd.js',
  '/troop370/campout-schedule-local-events.html',
  '/troop370/camps-adventure.html',
  '/troop370/contact-webmaster.html',
  '/troop370/contact.html',
  '/troop370/eagle-scout-honor-roll.html',
  '/troop370/faqs.html',
  '/troop370/finding-mb.html',
  '/troop370/forms-documents.html',
  '/troop370/helpful-links.html',
  '/troop370/leaders.html',
  '/troop370/leadership-training.html',
  '/troop370/new-scouts.html',
  '/troop370/participation.html',
  '/troop370/payments.html',
  '/troop370/photos.html',
  '/troop370/pine-straw-info.html',
  '/troop370/pinestraw.html',
  '/troop370/submission-received.html',
  '/troop370/'
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { // if cache is available, respond with cache
        console.log('responding with cache : ' + e.request.url)
        return request
      } else {       // if there are no cache, try fetching request
        console.log('file is not cached, fetching : ' + e.request.url)
        return fetch(e.request)
      }

      // You can omit if/else for console.log & put one line below here too.
      // return request || fetch(e.request)
    })
  )
})

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(URLS)
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheWhitelist.push(CACHE_NAME)
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i] )
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})
