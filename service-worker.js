const CACHE_NAME = 'wolf-book-v4';

// รายชื่อไฟล์ทั้งหมดที่ต้องการให้บันทึกไว้ใช้งานตอนออฟไลน์
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './roles.html',
  './how-to-play.html',
  './manifest.json',
  './hero-logo.png',
  './icon-192.png',
  './icon-512.png',
  // หากคุณมีไฟล์รูปไอคอน (icon-192.png, icon-512.png) ให้เพิ่มชื่อไฟล์ลงในบรรทัดถัดไปด้วยครับ
];

// 1. Install Event: ติดตั้ง Service Worker และบันทึกไฟล์ลง Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // บังคับให้ Service Worker ทำงานทันทีที่ติดตั้งเสร็จ
  self.skipWaiting();
});

// 2. Fetch Event: ดึงข้อมูลจาก Cache มาใช้เวลา Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ถ้าเจอไฟล์ใน Cache ให้ดึงมาใช้เลย (Offline) 
      if (cachedResponse) {
        return cachedResponse;
      }
      // ถ้าไม่เจอให้ดึงจากอินเทอร์เน็ตตามปกติ
      return fetch(event.request);
    })
  );
});

// 3. Activate Event: เคลียร์ Cache เก่าทิ้งเมื่อมีการอัปเดตเวอร์ชันใหม่ (เปลี่ยนชื่อ CACHE_NAME)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
