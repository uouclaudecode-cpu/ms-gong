// '지난 방문 이후' 계산.
// localStorage에 마지막 방문 때 본 공고 id들을 남겨 두고, 이번 방문(브라우저를 연 동안)에는
// 그 '지난번' 기록과 비교합니다. 새로고침해도 이번 방문 동안은 같은 결과가 나오도록 sessionStorage에 붙잡아 둡니다.
import { useMemo } from 'react';

const VISIT = 'ms-gong:visit'; // { at, seen: [공고 id] }
const SESSION = 'ms-gong:visit-prev'; // 이번 방문에서 비교할 '지난번' 기록

function read(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}
function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장을 못 하면 이번엔 '새 소식' 없이 지나갑니다
  }
}

/**
 * jobs: 진행 중 공고 전체(실데이터일 때만 넘기세요).
 * 반환: { prevAt, newIds: Set } — 처음 방문이면 prevAt이 null이고 newIds는 비어 있습니다.
 */
export function useSinceLastVisit(jobs) {
  return useMemo(() => {
    if (!jobs?.length || typeof window === 'undefined') return { prevAt: null, newIds: new Set() };

    // 이번 방문에서 처음 계산할 때: 지난 기록을 붙잡아 두고, 지금 본 공고로 기록을 바꿉니다
    let prev = read(sessionStorage, SESSION);
    if (!prev) {
      prev = read(localStorage, VISIT) ?? { at: null, seen: [] };
      write(sessionStorage, SESSION, prev);
      write(localStorage, VISIT, { at: new Date().toISOString(), seen: jobs.map((j) => j.id) });
    }

    const seen = new Set(prev.seen ?? []);
    const newIds = prev.at ? new Set(jobs.filter((j) => !seen.has(j.id)).map((j) => j.id)) : new Set();
    return { prevAt: prev.at, newIds };
  }, [jobs]);
}
