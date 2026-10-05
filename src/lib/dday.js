// 마감일 D-Day 계산. 날짜는 모두 한국 시간(KST) 기준 'YYYY-MM-DD'로 다룹니다.

const DAY = 24 * 60 * 60 * 1000;

/** 지금 한국 날짜를 'YYYY-MM-DD'로 */
export function todayKST(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' 두 날짜 사이의 일수 (b - a) */
function diffDays(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY);
}

/** 오늘에서 n일 뒤 'YYYY-MM-DD' (목업 데이터용) */
export function addDays(n, from = todayKST()) {
  return new Date(Date.parse(from) + n * DAY).toISOString().slice(0, 10);
}

/**
 * 마감일 정보를 돌려줍니다.
 * @returns {{ days: number|null, label: string, tone: 'closed'|'urgent'|'soon'|'normal'|'always' }}
 */
export function getDday(deadline, today = todayKST()) {
  if (!deadline) return { days: null, label: '상시', tone: 'always' };
  const days = diffDays(today, deadline);
  if (days < 0) return { days, label: '마감', tone: 'closed' };
  if (days === 0) return { days, label: 'D-Day', tone: 'urgent' };
  if (days <= 3) return { days, label: `D-${days}`, tone: 'urgent' };
  if (days <= 7) return { days, label: `D-${days}`, tone: 'soon' };
  return { days, label: `D-${days}`, tone: 'normal' };
}

/** 마감 임박 순 정렬: 마감 안 지난 것 → 상시 → 마감 지난 것 */
export function byDeadline(a, b) {
  const rank = (d) => (d.days === null ? 1e6 : d.days < 0 ? 2e6 - d.days : d.days);
  return rank(getDday(a.deadline)) - rank(getDday(b.deadline));
}

/** '2026-10-05' → '10월 5일 (월)' */
export function formatKoreanDate(ymd) {
  const d = new Date(Date.parse(ymd)); // UTC 자정으로 해석되므로 getUTC*로 읽습니다
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${'일월화수목금토'[d.getUTCDay()]})`;
}
