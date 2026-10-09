// ⚠️ 화면 개발용 예시 데이터입니다. 실제 공고·기사가 아닙니다.
// 나중에 src/data/api.js가 Supabase(수집기가 채운 표)에서 같은 모양의 데이터를 가져오도록 바꿉니다.
// 마감일은 오늘 기준 상대값으로 만들어서 언제 열어도 D-Day가 자연스럽게 보입니다.
import { addDays } from '../lib/dday.js';
import { BLOG_KEYWORDS, naverBlogSearchUrl, naverNewsSearchUrl, JOB_ALIO_URL } from '../lib/links.js';
import { getCompany } from './registry.js';

const job = (id, companyId, title, type, offset, extra = {}) => ({
  id,
  companyId,
  title,
  type, // '정규직' | '인턴' | '무기계약직' | '비정규직'
  career: '신입',
  // 마감이 가까운 공고는 오래전에, 먼 공고는 최근에 올라온 것처럼 (마감 14일 넘게 남으면 '새 공고')
  startsAt: addDays(offset === null || offset > 14 ? 0 : -10),
  deadline: offset === null ? null : addDays(offset),
  url: JOB_ALIO_URL,
  isSample: true,
  ...extra,
});

export const MOCK_JOBS = [
  job('j1', 'kepco', '(예시) 2026년 하반기 신입사원 채용', '정규직', 2, { headcount: '사무·전기 등 000명' }),
  job('j2', 'iiac', '(예시) 체험형 청년인턴 모집', '인턴', 5, { headcount: '00명' }),
  job('j3', 'nhis', '(예시) 6급 갑 신규직원 채용', '정규직', 9, { headcount: '행정·건강직 000명' }),
  job('j4', 'korail', '(예시) 하반기 신입사원 공개채용', '정규직', 12),
  job('j5', 'lh', '(예시) 채용형 인턴 모집', '인턴', 0),
  job('j6', 'kwater', '(예시) 신입 일반직 5급 채용', '정규직', 17),
  job('j7', 'comwel', '(예시) 체험형 인턴 상시 모집', '인턴', null),
  job('j8', 'knoc', '(예시) 신입 일반직 채용', '정규직', 21),
  job('j9', 'ewp', '(예시) 대졸수준 신입사원 채용', '정규직', 7),
  job('j10', 'khnp', '(예시) 하반기 대졸수준 신입 채용', '정규직', -3),
  job('j11', 'hira', '(예시) 청년인턴(체험형) 채용', '인턴', 3),
  job('j12', 'nps', '(예시) 6급 신규직원 채용', '정규직', 25),
  job('j13', 'ex', '(예시) 신입 채용형 인턴', '인턴', 14),
  job('j14', 'kamco', '(예시) 5급 신입직원 채용', '정규직', 10),
  job('j15', 'kogas', '(예시) 대졸수준 신입사원 채용', '정규직', 19),
  job('j16', 'hrdkorea', '(예시) 일반직 6급 신규직원 채용', '정규직', 6),
];

const news = (id, companyId, topic, title, daysAgo) => ({
  id,
  companyId,
  topic, // '이슈' | '경영평가' | '정책' | '채용'
  title,
  description: '네이버 뉴스 검색 키를 연결하면 실제 기사 요약이 여기에 나와요.',
  publishedAt: addDays(-daysAgo),
  press: '예시',
  // 예시 기사 대신 해당 기업의 실제 최신 뉴스 검색으로 연결합니다.
  url: naverNewsSearchUrl(getCompany(companyId).name),
  isSample: true,
});

export const MOCK_NEWS = [
  news('n1', 'kepco', '정책', '(예시) 전력망 확충 계획 발표, 신규 인력 수요 늘 듯', 0),
  news('n2', 'iiac', '이슈', '(예시) 4단계 확장 이후 여객 처리 능력 확대', 1),
  news('n3', 'nhis', '경영평가', '(예시) 공공기관 경영평가 결과 발표', 1),
  news('n4', 'korail', '채용', '(예시) 하반기 채용 규모 확대 예정', 2),
  news('n5', 'lh', '정책', '(예시) 공공주택 공급 계획 조정', 3),
  news('n6', 'kwater', '이슈', '(예시) 기후 대응 물관리 사업 추진', 3),
  news('n7', 'comwel', '정책', '(예시) 산재보험 제도 개선안 발표', 4),
  news('n8', 'knoc', '이슈', '(예시) 해외 자원개발 사업 현황 점검', 5),
  news('n9', 'khnp', '정책', '(예시) 원전 수출 관련 협력 확대', 2),
  news('n10', 'ewp', '경영평가', '(예시) ESG 경영 평가 등급 상향', 6),
  news('n11', 'hira', '이슈', '(예시) 의료 데이터 개방 확대', 4),
  news('n12', 'nps', '정책', '(예시) 연금 개혁 논의 진행 상황', 1),
  news('n13', 'ex', '채용', '(예시) 청년 인턴 채용 일정 공개', 2),
  news('n14', 'kamco', '이슈', '(예시) 취약 채무자 지원 프로그램 확대', 5),
  news('n15', 'kogas', '경영평가', '(예시) 재무 구조 개선 성과 점검', 7),
  news('n16', 'hrdkorea', '채용', '(예시) 국가기술자격 시험 일정 공지', 3),
];

// 블로그 예시: 가짜 글 대신 실제 네이버 블로그 검색 결과로 연결합니다.
export const MOCK_BLOG = (companyId, kw) => {
  const c = getCompany(companyId);
  const k = BLOG_KEYWORDS.find((x) => x.key === kw) ?? BLOG_KEYWORDS[0];
  return [1, 2, 3].map((i) => ({
    title: `(예시) ${c.short} ${k.label} 글 ${i}`,
    description: '네이버 검색 API 키를 연결하면 실제 블로그 글 목록이 여기에 나와요. 지금은 누르면 네이버 블로그 검색으로 이동해요.',
    url: naverBlogSearchUrl(c.name, k.query),
    blogger: '예시',
    postedAt: addDays(-i * 3),
  }));
};
