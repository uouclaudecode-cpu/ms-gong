# 공기업 패스 (ms-gong): Claude 작업 안내

공기업 취준생이 관심 기업(My 픽)을 골라 채용 공고·뉴스·네이버 블로그 합격 후기를 모아 보는 사이트.
Vite 5 + React 18 + React Router 6 + Tailwind 3 (로컬 Node 18이라 이 버전에 맞춤).

## 구조
- `src/data/companies.js` 기업 목록. `id`는 URL·localStorage에 쓰이므로 바꾸지 않음
- `src/data/api.js` 데이터 가져오는 유일한 곳. 지금은 `mock.js`(예시 데이터, 제목에 "(예시)") 반환
- `src/context/PickContext.jsx` My 픽 전역 상태 + localStorage(`ms-gong:picks`)
- `src/lib/dday.js` D-Day 계산(KST), `src/lib/links.js` 네이버 블로그/뉴스 검색 링크
- 라우트: `/` 대시보드(`?c=기업id` 필터), `/pick`, `/company/:id`

## 다음 단계
- 채용: 공공데이터포털 잡알리오 API → 수집기(GitHub Actions) → Supabase → `api.js`
- 뉴스: 네이버 뉴스 검색 API → 같은 경로
- 예시 데이터는 실제 공고처럼 보이지 않게 "(예시)" 표시를 유지

## 실행
npm run dev / npm run build
