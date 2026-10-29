var CACHE_NAME = "kadai-manager-v19";
var APP_FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(APP_FILES); }));
    self.skipWaiting();
});
self.addEventListener("activate", function(event) {
    event.waitUntil(caches.keys().then(function(names) {
        return Promise.all(names.filter(function(name) {
            return name.indexOf("kadai-manager-") === 0 && name !== CACHE_NAME;
        }).map(function(name) { return caches.delete(name); }));
    }).then(function() { return self.clients.claim(); }));
});
self.addEventListener("fetch", function(event) {
    // Cache only public static files, never authentication, Firestore, or location requests.
    if(event.request.method !== "GET") return;
    var url = new URL(event.request.url);
    var publicFiles = APP_FILES.map(function(path) { return new URL(path, self.registration.scope).href; });
    if(url.origin !== self.location.origin || url.search || event.request.headers.has("Authorization") || publicFiles.indexOf(url.href) === -1) return;
    event.respondWith(fetch(event.request).then(function(response) {
        if(response.ok && response.type === "basic") {
            var copy = response.clone();
            return caches.open(CACHE_NAME).then(function(cache) { return cache.put(event.request, copy); }).catch(function() {}).then(function() { return response; });
        }
        return response;
    }).catch(function() { return caches.match(event.request); }));
});
