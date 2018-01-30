var identifier = 'citroner-version-6';
var files = [
      '/'
    , '/index.html'
    , '/css/style.css'
    , '/javascript/sitescript.js'
    , '/javascript/shellcheck.js'
    , '/javascript/shellredirect.js'
    , '/post/offline/'
    , '/post/index-articles.html'
    , '/manifest.json'
];
self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(identifier).then(function (cache) {
        return cache.addAll(files);
    }));
});
this.addEventListener('activate', function (event) {
    var whitelist = [identifier];
    event.waitUntil(caches.keys().then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
            if (whitelist.indexOf(key) === -1) {
                return caches.delete(key);
            }
        }));
    }));
});
self.addEventListener('fetch', function (event) {
    event.respondWith(caches.open(identifier).then(function (cache) {
        return cache.match(event.request).then(function (response) {
            var fetchPromise = fetch(event.request).then(function (networkResponse) {
                if (!event.request.url.includes("--no-caching")) {
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(logError);
            return response || fetchPromise;
        })
    }));
});

function logError(message) {
    console.warn("Fetch: failed fetching data, ok if offline");
    console.warn(message);
}
/*
self.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request).then(function (response) {
        // If file exist in cache, serve it
        if (response) {
            return response;
        }
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(function (response) {
            // Check if we received a valid response
            if (!response && response.ok) {
                return response;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();
            caches.open(identifier).then(function (cache) {
                cache.put(event.request, responseToCache);
            });
            return response;
        });
    }));
    event.waitUntil(update(event.request));
});

function update(request) {
    return caches.open(identifier).then(function (cache) {
        return fetch(request).then(function (response) {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            else {
                // If request is valid, store it in the cache
                return cache.put(request, response);
            }
        });
    });
}
/*
this.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request).then(function (cacheResponse) {
        if (cacheResponse) {
            return cacheResponse;
        }
        else {
            return downloadRequest(event);
        }
    }).catch(function () {
        // If not in cache and on network, show offline page
        return caches.match('/post/offline.html');
    }));
    //event.waitUntil();
});
*/
