// 홈 화면 설치를 위한 최소 서비스워커.
// 공고·뉴스는 늘 최신이어야 하므로 캐시하지 않고, 인터넷이 끊겼을 때만 안내 화면을 보여 줍니다.
const OFFLINE_HTML = `<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MS PICK</title>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f8fafc;color:#0f172a;text-align:center">
<div><p style="font-size:48px;margin:0">📡</p><h1 style="font-size:20px">인터넷 연결이 없어요</h1>
<p style="color:#64748b">연결되면 다시 열어 주세요.</p></div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return; // 페이지 이동만 다루고 나머지는 브라우저에 맡깁니다
  event.respondWith(
    fetch(event.request).catch(
      () => new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    ),
  );
});
