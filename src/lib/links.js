// 외부 검색 링크를 만드는 함수들. 키워드는 여기서만 관리합니다.

export const BLOG_KEYWORDS = [
  { key: 'review', label: 'NCS 합격 후기', query: 'NCS 합격 후기' },
  { key: 'written', label: '필기 공부법', query: '필기 공부법' },
  { key: 'interview', label: '면접 후기', query: '면접 후기' },
  { key: 'essay', label: '자소서', query: '자기소개서 항목' },
];

/** 네이버 블로그 탭 검색 결과 주소 */
export function naverBlogSearchUrl(companyName, query) {
  const q = `${companyName} ${query}`;
  return `https://search.naver.com/search.naver?ssc=tab.blog.all&query=${encodeURIComponent(q)}`;
}

/** 네이버 뉴스 최신순 검색 결과 주소 */
export function naverNewsSearchUrl(companyName) {
  return `https://search.naver.com/search.naver?where=news&sort=1&query=${encodeURIComponent(companyName)}`;
}

/** 구글 캘린더 '일정 추가' 화면 주소: 마감일 하루 종일 일정 */
export function googleCalendarUrl({ title, deadline, url, companyName }) {
  const d = deadline.replace(/-/g, '');
  const next = new Date(Date.parse(deadline) + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[마감] ${companyName} ${title}`,
    dates: `${d}/${next}`,
    details: `MS PICK에서 저장한 공고\n${jobLink({ url }, { forceMobile: true })}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** 내 픽 공유 주소: /?picks=kepco,iiac */
export function sharePicksUrl(picks) {
  return `${window.location.origin}/?picks=${picks.join(',')}`;
}

// 잡알리오 PC 공고 페이지는 휴대폰(안드로이드·아이폰 등)으로 열면 모바일 첫 화면으로 보내 버려서
// 어떤 공고였는지 사라집니다. 휴대폰에서는 처음부터 모바일 공고 페이지로 연결합니다.
// (잡알리오 페이지의 판별 규칙과 같게 맞춤)
const ALIO_MOBILE_UA = /iPhone|iPod|Windows CE|Symbian|BlackBerry|Android/i;
const ALIO_PC_VIEW = /^https:\/\/job\.alio\.go\.kr\/recruitview\.do\?idx=(\d+)/i;

/**
 * 공고 원문 주소: 휴대폰이면 잡알리오 모바일 공고 페이지.
 * forceMobile: 캘린더 일정처럼 나중에 어느 기기에서 열지 모를 때 (모바일 페이지는 PC에서도 열림)
 */
export function jobLink(job, { forceMobile = false } = {}) {
  const m = job.url?.match(ALIO_PC_VIEW);
  if (m && (forceMobile || (typeof navigator !== 'undefined' && ALIO_MOBILE_UA.test(navigator.userAgent)))) {
    return `https://job.alio.go.kr/mobile2021/recruit/recruitView.do?idx=${m[1]}`;
  }
  return job.url;
}

/** 잡알리오(공공기관 채용정보시스템) */
export const JOB_ALIO_URL = 'https://job.alio.go.kr/recruit.do';
