// 사용자 설정 전역 상태: My 픽 공기업 + 보고 싶은 고용형태.
// 브라우저 localStorage에 저장돼 새로고침해도 유지됩니다.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { COMPANY_BY_ID } from '../data/companies.js';

const STORAGE_KEY = 'ms-gong:picks';
const HIRE_KEY = 'ms-gong:hire-types';
export const HIRE_TYPES = ['정규직', '인턴', '무기계약직', '비정규직'];
const DEFAULT_HIRE = ['정규직', '인턴'];
const PickContext = createContext(null);

function load(key, valid, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
    return Array.isArray(saved) ? saved.filter(valid) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 막힌 환경(시크릿 창 등)에서는 이번 방문 동안만 유지합니다.
  }
}

const toggleIn = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function PickProvider({ children }) {
  // 목록에서 빠진 기업 id는 버립니다.
  const [picks, setPicks] = useState(() => load(STORAGE_KEY, (id) => COMPANY_BY_ID[id], []));
  const [hireTypes, setHireTypes] = useState(() => load(HIRE_KEY, (t) => HIRE_TYPES.includes(t), DEFAULT_HIRE));

  useEffect(() => save(STORAGE_KEY, picks), [picks]);
  useEffect(() => save(HIRE_KEY, hireTypes), [hireTypes]);

  const toggle = useCallback((id) => setPicks((prev) => toggleIn(prev, id)), []);
  const isPicked = useCallback((id) => picks.includes(id), [picks]);
  const clear = useCallback(() => setPicks([]), []);
  const toggleHireType = useCallback((t) => setHireTypes((prev) => toggleIn(prev, t)), []);

  const value = useMemo(
    () => ({ picks, toggle, isPicked, clear, setPicks, hireTypes, toggleHireType }),
    [picks, toggle, isPicked, clear, hireTypes, toggleHireType],
  );
  return <PickContext.Provider value={value}>{children}</PickContext.Provider>;
}

export function usePicks() {
  const ctx = useContext(PickContext);
  if (!ctx) throw new Error('usePicks는 PickProvider 안에서만 쓸 수 있어요');
  return ctx;
}
