var APP_PREFIX = 'troop370_'
var VERSION = 'version_21' // update the version every time the website is updated (or the content will not update on PWAs)
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [
  '/index.html?utm_source=homescreen',
  '/index.html',
  '/about.html',
  '/advancement.html',
  '/calendar_encrypted.html',
  '/campout-schedule-local-events.html',
  '/camps-adventure.html',
  '/contact-webmaster.html',
  '/contact.html',
  '/eagle-scout-honor-roll.html',
  '/email-newsletters_encrypted.html',
  '/faqs.html',
  '/finding-mb.html',
  '/forms-documents.html',
  '/helpful-links.html',
  'https://npmcdn.com/flickity@2/dist/flickity.css',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.8/js/materialize.js',
  'https://npmcdn.com/flickity@2/dist/flickity.pkgd.js',
  '/leaders.html',
  '/leadership-training.html',
  '/manifest.json',
  '/mb-counselors_encrypted.html',
  '/new-scouts.html',
  '/participation.html',
  '/payments.html',
  '/photos.html',
  '/pinestraw.html',
  '/recharter.html',
  '/resources/flickity/flickity.css',
  '/resources/flickity/flickity.pkgd.js',
  '/resources/materialize/0.97.8/css/materialize.css',
  '/scripts/bundle.js',
  '/scripts/insert-header-footer.js',
  '/src/fonts/IBM_Plex_Sans_Bold.woff',
  '/src/icons/meeting icon.png',
  '/src/troop370-logo/bugle-logo-512x512.png',
  '/src/troop370-logo/favicon.ico',
  '/styles/components.css',
  '/styles/legacy_components.css',
  '/styles/page-specific.css',
  '/styles/troop370-topnav.css',
  '/styles/bundle.css',
  '/submission-received.html',
  '/troop-roster_encrypted.html',
  '/what-can-i-do_encrypted.html',
  '/'
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
