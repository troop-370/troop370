var APP_PREFIX = 'troop370_'
var VERSION = 'version_10' // update the version every time the website is updated (or the content will not update on PWAs)
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [
  '/styles/components.css'7
  '/styles/page-specific.css',
  '/styles/troop370-topnav.css',
  '/resources/materialize/0.97.8/css/materialize.css',
  '/resources/flickity/flickity.css',
  'https://npmcdn.com/flickity@2/dist/flickity.css',
  '/resources/flickity/flickity.pkgd.js',
  '/scripts/insert-header-footer.js',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  '/index.html#home?utm_source=homescreen',
  '/index.html#html',
  '/index.html',
  '/about.html',
  '/advancement.html',
  '/campout-schedule-local-events.html',
  '/manifest.json',
  '/src/icons/meeting icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.8/js/materialize.js',
  'https://npmcdn.com/flickity@2/dist/flickity.pkgd.js',
  '/campout-schedule-local-events.html',
  '/camps-adventure.html',
  '/contact-webmaster.html',
  '/contact.html',
  '/eagle-scout-honor-roll.html',
  '/faqs.html',
  '/finding-mb.html',
  '/forms-documents.html',
  '/helpful-links.html',
  '/leaders.html',
  '/leadership-training.html',
  '/new-scouts.html',
  '/participation.html',
  '/payments.html',
  '/photos.html',
  '/pinestraw.html',
  '/submission-received.html',
  '/calendar_encrypted.html',
  '/email-newsletters_encrypted.html',
  '/mb-counselors_encrypted.html',
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
