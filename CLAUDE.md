# MS PICK (ms-gong): Claude 작업 안내

MS PICK = My Selection PICK. 공기업 취준생이 관심 기업(My 픽)을 골라 채용 공고·뉴스·네이버 블로그 합격 후기를 모아 보는 사이트.
Vite 5 + React 18 + React Router 6 + Tailwind 3 (로컬 Node 18이라 이 버전에 맞춤). 배포: Vercel.
원격: `uouclaudecode-cpu/ms-gong`(공개 저장소). `main`에 푸시하면 Vercel이 다시 배포합니다.
주소: https://ms-gong.vercel.app (사용자가 주소 변경은 원하지 않음)

## 구조
- `api/*.js` Vercel 서버 함수. 외부 API 키는 여기서만 씀(브라우저로 보내지 않음). 결과는 CDN 캐시
  - `/api/jobs` 잡알리오(공공데이터포털 `apis.data.go.kr/1051000/recruitment/list`) 진행 중 공고 전체. 우리 목록 기업은 그 id, 나머지 기관은 `x-기관코드`(예: `x-C0021`) + `institutions`
  - `/api/institutions` 최근 공고를 낸 목록 밖 공공기관(진행 중 + 최근 마감 1,500건에서 모음, 하루 캐시)
  - `/api/trend?id=` 기관코드(`pblntInstCd`)로 최근 3년 공고 → 연도별·달별(정규직·인턴)·최근 공고. 최대 1,500건(`partial`)
  - 잡알리오 호출은 `api/_lib/util.js`의 `alioList()`(재시도 포함). 개발계정 하루 1,000회 한도를 의식해 캐시를 길게 둠
  - 목록 밖 기관 id는 `resolveCompany()`가 잡알리오에서 이름을 확인(아무 검색어 대리 검색 방지)
  - `/api/news?id=kepco` 기업별 최근 6개월 뉴스(최신순 + "기업명 2026년 7월" 달별 검색으로 과거를 채움, 달마다 최대 12개). 화면은 기업마다 따로 불러 합침. 네이버 뉴스 검색(NAVER API HUB `naverapihub.apigw.ntruss.com`, 헤더 `X-NCP-APIGW-API-KEY-ID/KEY`), 주제(채용·경영평가·정책·이슈)는 단어 규칙으로 분류
  - `/api/blog?company=kepco&kw=review` 네이버 블로그 검색 (탭·검색어는 `src/lib/links.js`의 `BLOG_KEYWORDS`). 제목에 기관명+탭 주제, 홍보(`PROMO`)·무관(`OFF_TOPIC`) 글 제외, 최근 3년(모자라면 5년) 최신순
  - 로컬 `npm run dev`에서는 `vite.config.js`의 `localApi` 플러그인이 같은 함수를 실행
- `src/data/api.js` 화면이 데이터를 가져오는 유일한 곳. 키가 없거나 실패하면 `mock.js` 예시로 대신하고 `live: false`
- `src/data/companies.js` 기업 목록. `id`는 URL·localStorage에 쓰이므로 바꾸지 않음.
  `name`은 잡알리오 기관명과 같아야 공고가 매칭됨. `code`=잡알리오 기관코드, `excludes`=자회사 이름(뉴스·블로그 오인식 방지)
- 화면에서 기업 찾기는 `src/data/registry.js`의 `getCompany(id)` (목록 + 목록 밖 기관). `COMPANY_BY_ID`를 화면에서 직접 쓰지 않음
- 기업명 언급 판별 `mentions()`(api/_lib/util.js): 자회사·뒤에 영문(한전KPS)·약칭 앞 한글(인천국제공항공사)을 거름
- 기관 정보(신입 초임·평균보수·정규직 수)는 `public/data/company-info.json`. `npm run company-info`로 ALIO 통계에서 새로 받음(1년에 한 번쯤)
- 지원 현황 단계·새 공고·신입/경력 규칙은 `src/lib/apply.js`
- `src/context/PickContext.jsx` 전역 상태 + localStorage: My 픽(`ms-gong:picks`), 고용형태(`ms-gong:hire-types`), 신입/경력(`ms-gong:career`), 찜한 공고(`ms-gong:saved-jobs`, 공고 객체 통째로 + `status` 지원 단계), 목록 밖 기관 이름(`ms-gong:institutions`), 테마(`ms-gong:theme`)
- 잡알리오 공고 링크는 `jobLink()`(src/lib/links.js)로: 휴대폰이면 모바일 공고 페이지(`/mobile2021/recruit/recruitView.do?idx=`). PC 주소는 휴대폰에서 모바일 첫 화면으로 튕김
- 라우트: `/` 홈(`?c=기업id` 필터, `?picks=a,b` 공유받은 픽), `/calendar`, `/saved`, `/pick`, `/company/:id`(`#blog`)
- 디자인: Tailwind `darkMode: class`. 공통 모양은 `src/index.css`의 `.card` `.chip` `.btn-primary` 등을 씀. 색은 `brand`(보라)·`pick`(민트)

## 환경변수 (`.env.example` 참고)
`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `DATA_GO_KR_KEY`.
로컬은 `.env.local`, 배포는 Vercel 프로젝트 설정. 키 값은 사용자가 직접 넣습니다.

## 규칙
- 예시 데이터는 실제 공고처럼 보이지 않게 "(예시)" 표시를 유지
- 블로그·뉴스는 제목·요약·링크만 보여 주고 본문을 가져오지 않음

## 실행·점검
npm run dev / npm run build / npm test (`node --test`가 tests/*.test.js를 찾음. 폴더 이름을 주면 Node 21+에서 실패. 규칙을 바꾸면 테스트도 같이)
GitHub Actions `test.yml`이 main 푸시마다 npm test + build

## 앱 설치·공유 이미지·통계
- 홈 화면 설치: `public/manifest.webmanifest`, `public/sw.js`(캐시 안 함, 오프라인 안내만), `src/components/InstallApp.jsx`
- 아이콘·공유 미리보기(`public/icon-*.png`, `apple-touch-icon.png`, `og.png`)는 `npm run images`(sharp, 맑은 고딕)로 만들고 결과 PNG를 커밋
- 공유 미리보기 주소는 `index.html`의 `og:url`·`og:image`(현재 `https://ms-gong.vercel.app`). 주소를 바꾸면 같이 바꿈
- 방문자 통계: `@vercel/analytics` (`src/main.jsx`). Vercel 프로젝트 Analytics 탭에서 켜야 수집됨

## 미리 불러 두기 (스냅숏)
- `.github/workflows/snapshot.yml`: 매시 7분 진행 중 공고, 매일 04:37(KST) 공고+기관 목록+기업별 트렌드 → `scripts/snapshot.mjs` → 이 저장소의 `data` 브랜치(커밋 하나로 덮어씀)
- 서버 함수는 `api/_lib/snapshot.js`의 `snapshotOr()`로 raw.githubusercontent의 파일을 먼저 읽고, 없거나 오래되면(공고 3시간·기관 2일·트렌드 3일) 잡알리오 직접 호출
- 데이터 만드는 코드는 `api/_lib/builders.js` 하나 (서버 함수·스냅숏 공용)
- 저장소 Secrets에 `DATA_GO_KR_KEY` 필요. 없으면 경고만 남기고 건너뜀
- `vercel.json`의 `git.deploymentEnabled.data: false`: data 브랜치 푸시로는 배포 안 함

## 화면 오류
- `src/components/ErrorBoundary.jsx`: 페이지 전체(Layout, 주소 바뀌면 다시 시도) + 섹션별 `<Safe name="뉴스">`. 새 섹션을 만들면 Safe로 감쌈
