// "My 픽" 공기업 전역 상태. 브라우저 localStorage에 저장돼 새로고침해도 유지됩니다.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { COMPANY_BY_ID } from '../data/companies.js';

const STORAGE_KEY = 'ms-gong:picks';
const PickContext = createContext(null);

function loadPicks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    // 목록에서 빠진 기업 id는 버립니다.
    return Array.isArray(saved) ? saved.filter((id) => COMPANY_BY_ID[id]) : [];
  } catch {
    return [];
  }
}

export function PickProvider({ children }) {
  const [picks, setPicks] = useState(loadPicks);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch {
      // 저장이 막힌 환경(시크릿 창 등)에서는 이번 방문 동안만 유지합니다.
    }
  }, [picks]);

  const toggle = useCallback(
    (id) => setPicks((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])),
    [],
  );
  const isPicked = useCallback((id) => picks.includes(id), [picks]);
  const clear = useCallback(() => setPicks([]), []);

  const value = useMemo(() => ({ picks, toggle, isPicked, clear, setPicks }), [picks, toggle, isPicked, clear]);
  return <PickContext.Provider value={value}>{children}</PickContext.Provider>;
}

export function usePicks() {
  const ctx = useContext(PickContext);
  if (!ctx) throw new Error('usePicks는 PickProvider 안에서만 쓸 수 있어요');
  return ctx;
}
