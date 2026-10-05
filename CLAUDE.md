# 공기업 패스 (ms-gong): Claude 작업 안내

공기업 취준생이 관심 기업(My 픽)을 골라 채용 공고·뉴스·네이버 블로그 합격 후기를 모아 보는 사이트.
Vite 5 + React 18 + React Router 6 + Tailwind 3 (로컬 Node 18이라 이 버전에 맞춤). 배포: Vercel.
원격: `uouclaudecode-cpu/ms-gong`. `main`에 푸시하면 Vercel이 다시 배포합니다.

## 구조
- `api/*.js` Vercel 서버 함수. 외부 API 키는 여기서만 씀(브라우저로 보내지 않음). 결과는 CDN 캐시
  - `/api/jobs` 잡알리오(공공데이터포털 `apis.data.go.kr/1051000/recruitment/list`) 진행 중 공고 → 기관명으로 거름
  - `/api/news?ids=kepco,iiac` 네이버 뉴스 검색(NAVER API HUB `naverapihub.apigw.ntruss.com`, 헤더 `X-NCP-APIGW-API-KEY-ID/KEY`), 주제(채용·경영평가·정책·이슈)는 단어 규칙으로 분류
  - `/api/blog?company=kepco&kw=review` 네이버 블로그 검색 (키워드는 `src/lib/links.js`의 `BLOG_KEYWORDS`)
  - 로컬 `npm run dev`에서는 `vite.config.js`의 `localApi` 플러그인이 같은 함수를 실행
- `src/data/api.js` 화면이 데이터를 가져오는 유일한 곳. 키가 없거나 실패하면 `mock.js` 예시로 대신하고 `live: false`
- `src/data/companies.js` 기업 목록. `id`는 URL·localStorage에 쓰이므로 바꾸지 않음.
  `name`은 잡알리오 기관명과 같아야 공고가 매칭됨
- `src/context/PickContext.jsx` My 픽 전역 상태 + localStorage(`ms-gong:picks`)
- 라우트: `/` 대시보드(`?c=기업id` 필터), `/pick`, `/company/:id`(`#blog`로 블로그 섹션)

## 환경변수 (`.env.example` 참고)
`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `DATA_GO_KR_KEY`.
로컬은 `.env.local`, 배포는 Vercel 프로젝트 설정. 키 값은 사용자가 직접 넣습니다.

## 규칙
- 예시 데이터는 실제 공고처럼 보이지 않게 "(예시)" 표시를 유지
- 블로그·뉴스는 제목·요약·링크만 보여 주고 본문을 가져오지 않음

## 실행
npm run dev / npm run build
