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

/** 잡알리오(공공기관 채용정보시스템) */
export const JOB_ALIO_URL = 'https://job.alio.go.kr/recruit.do';
