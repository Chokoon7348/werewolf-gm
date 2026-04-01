const CACHE_NAME = 'wolf-book-v10';

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
// 3. ระบบติดตั้ง PWA ขั้นสูง (พร้อมระบบ Alert อธิบายวิธีติดตั้งเอง)
        let deferredPrompt;
        const installBtns = document.querySelectorAll('.install-app-btn');

        // ดักจับ Event หากเบราว์เซอร์พร้อมให้ติดตั้งอัตโนมัติ
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('PWA Install prompt is ready.');
        });

        // เมื่อคลิกปุ่ม "ติดตั้งแอป" ใดๆ ในหน้าจอ
        installBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    // ถ้าระบบพร้อม ให้เด้งหน้าต่างติดตั้งอัตโนมัติ
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        deferredPrompt = null;
                    }
                } else {
                    // ถ้าระบบไม่รองรับอัตโนมัติ (เช่น iOS หรือติดตั้งไปแล้ว) ให้ขึ้นข้อความสอน
                    alert("💡 เบราว์เซอร์ของคุณไม่รองรับการติดตั้งอัตโนมัติ หรือคุณได้ติดตั้งแอปนี้ไปแล้ว\n\n📌 สำหรับ iOS (Safari): แตะปุ่ม 'แชร์' ด้านล่าง แล้วเลือก 'เพิ่มไปยังหน้าจอโฮม'\n\n📌 สำหรับ Android (Chrome): แตะเมนู 3 จุดมุมขวาบน แล้วเลือก 'เพิ่มลงในหน้าจอหลัก'");
                }
            });
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            console.log('PWA was installed successfully');
        });
