// 앱 아이콘(홈 화면 설치용)과 공유 미리보기 이미지(카톡·문자 링크 카드)를 만듭니다.
// 로고나 문구를 바꾼 뒤 한 번 실행하고, 결과 PNG를 커밋하세요:  npm run images
// 한글 글꼴은 이 컴퓨터(Windows)의 맑은 고딕을 씁니다.
import sharp from 'sharp';

const OUT = new URL('../public/', import.meta.url);
const FONT = "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";

const defs = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8a7dff"/>
      <stop offset="1" stop-color="#4a34d6"/>
    </linearGradient>
  </defs>`;
const check = (scale = 1, dx = 0, dy = 0) =>
  `<path transform="translate(${dx} ${dy}) scale(${scale})" d="M18 33.5l9 9 19-21" fill="none" stroke="#3ee0b0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;

// 일반 아이콘: 둥근 사각형
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${defs}
  <rect width="64" height="64" rx="14" fill="url(#g)"/>${check()}</svg>`;

// 마스커블·애플 아이콘: 기기가 모양을 잘라내므로 꽉 찬 사각형 + 가운데 작게
const fullBleed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${defs}
  <rect width="64" height="64" fill="url(#g)"/>${check(0.72, 9, 9)}</svg>`;

// 공유 미리보기 1200×630
// 글자 폭 대략 계산(한글 26px, 영문·기호 14px)으로 칩을 왼쪽부터 차례로 놓습니다
const textWidth = (t) => [...t].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2000 ? 26 : 14), 0);
function chips(labels, x = 80, y = 470, gap = 14) {
  return labels
    .map((text) => {
      const w = textWidth(text) + 44;
      const g = `<g transform="translate(${x} ${y})">
        <rect width="${w}" height="56" rx="16" fill="#ffffff" fill-opacity="0.16"/>
        <text x="22" y="37" font-size="26" font-weight="700" fill="#fff" font-family="${FONT}">${text}</text>
      </g>`;
      x += w + gap;
      return g;
    })
    .join('');
}
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6d5cff"/>
      <stop offset="0.55" stop-color="#5a43f5"/>
      <stop offset="1" stop-color="#3b2aa8"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mint" cx="0.35" cy="1" r="0.5">
      <stop offset="0" stop-color="#3ee0b0" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#3ee0b0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#mint)"/>

  <g transform="translate(80 78)">
    <rect width="88" height="88" rx="22" fill="#ffffff" fill-opacity="0.18"/>
    ${check(1.375, 0, 0)}
    <text x="112" y="64" font-size="58" font-weight="900" fill="#fff" font-family="Arial Black, ${FONT}" letter-spacing="-1">MS <tspan fill="#3ee0b0">PICK</tspan></text>
  </g>

  <text x="80" y="300" font-size="72" font-weight="800" fill="#fff" font-family="${FONT}" letter-spacing="-2">내가 고른 공기업만,</text>
  <text x="80" y="392" font-size="72" font-weight="800" fill="#fff" font-family="${FONT}" letter-spacing="-2">딱 필요한 것만.</text>

  ${chips(['채용 D-Day', '기업별 뉴스', '블로그 합격 후기', '공고 찜·캘린더'])}
  <text x="1120" y="580" text-anchor="end" font-size="24" font-weight="600" fill="#ffffff" fill-opacity="0.7" font-family="${FONT}">My Selection PICK · 공기업 취준 큐레이션</text>
</svg>`;

const jobs = [
  [icon, 'icon-192.png', 192],
  [icon, 'icon-512.png', 512],
  [fullBleed, 'icon-maskable-512.png', 512],
  [fullBleed, 'apple-touch-icon.png', 180],
];
for (const [svg, name, size] of jobs) {
  await sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toFile(new URL(name, OUT).pathname.slice(1));
  console.log('✓', name);
}
await sharp(Buffer.from(og)).png().toFile(new URL('og.png', OUT).pathname.slice(1));
console.log('✓ og.png');
