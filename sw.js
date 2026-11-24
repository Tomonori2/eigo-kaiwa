// Service Worker（アプリを裏で支える小さなプログラム）
// 役割: ファイルを保存しておいて、電波が悪くてもアプリを開けるようにする
// ※ アプリを直したら CACHE_NAME の番号を上げること。上げないとスマホが古い版を出し続ける
const CACHE_NAME = "eigo-kaiwa-v3";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// ページを開く時: まずネットから取得、ダメなら保存データを使う
// （Geminiへの通信など、自分のファイル以外はそのまま通す）
self.addEventListener("fetch", (e) => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request))
  );
});
