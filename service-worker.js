self.addEventListener("install", (event) => {
    console.log("Service Worker Installed");
});

self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
});
