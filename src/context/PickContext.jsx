// 사용자 설정 전역 상태: My 픽 공기업 · 보고 싶은 고용형태·신입/경력 · 찜한 공고(지원 현황) · 화면 테마.
// 로그인이 없으므로 전부 이 브라우저 localStorage에 저장합니다.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isKnownCompanyId, registerInstitutions } from '../data/registry.js';
import { CAREERS, STAGE_BY_KEY } from '../lib/apply.js';

const KEYS = {
  picks: 'ms-gong:picks',
  hire: 'ms-gong:hire-types',
  career: 'ms-gong:career',
  saved: 'ms-gong:saved-jobs',
  theme: 'ms-gong:theme',
};
export const HIRE_TYPES = ['정규직', '인턴', '무기계약직', '비정규직'];
const DEFAULT_HIRE = ['정규직', '인턴'];
const PickContext = createContext(null);

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? 'null');
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // 저장이 막힌 환경(시크릿 창 등)에서는 이번 방문 동안만 유지합니다.
  }
}

const arr = (v) => (Array.isArray(v) ? v : []);
const toggleIn = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function initialTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function PickProvider({ children }) {
  // 알 수 없는 id(목록에서 빠진 기업 등)는 버립니다. 그 밖의 공공기관('x-C0008')은 그대로 둡니다.
  const [picks, setPicks] = useState(() => arr(load(KEYS.picks, [])).filter(isKnownCompanyId));
  const [hireTypes, setHireTypes] = useState(() => {
    const v = load(KEYS.hire, null);
    return Array.isArray(v) ? v.filter((t) => HIRE_TYPES.includes(t)) : DEFAULT_HIRE;
  });
  const [career, setCareer] = useState(() => {
    const v = load(KEYS.career, 'new');
    return CAREERS.some((c) => c.key === v) ? v : 'new';
  });
  // 공고가 마감돼 목록에서 사라져도 찜 목록에는 남도록 공고 정보를 통째로 저장합니다.
  const [saved, setSaved] = useState(() => arr(load(KEYS.saved, [])).filter((j) => j?.id && isKnownCompanyId(j.companyId)));
  const [theme, setTheme] = useState(initialTheme);
  // 그 밖의 공공기관 이름을 새로 알게 되면 화면을 다시 그리게 하는 숫자
  const [institutionsVersion, setInstitutionsVersion] = useState(0);

  useEffect(() => save(KEYS.picks, picks), [picks]);
  useEffect(() => save(KEYS.hire, hireTypes), [hireTypes]);
  useEffect(() => save(KEYS.career, career), [career]);
  useEffect(() => save(KEYS.saved, saved), [saved]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    save(KEYS.theme, theme);
  }, [theme]);

  const toggle = useCallback((id) => setPicks((prev) => toggleIn(prev, id)), []);
  const isPicked = useCallback((id) => picks.includes(id), [picks]);
  const clear = useCallback(() => setPicks([]), []);
  const toggleHireType = useCallback((t) => setHireTypes((prev) => toggleIn(prev, t)), []);

  const isSaved = useCallback((id) => saved.some((j) => j.id === id), [saved]);
  const toggleSaved = useCallback((job) => {
    setSaved((prev) =>
      prev.some((j) => j.id === job.id)
        ? prev.filter((j) => j.id !== job.id)
        : [...prev, { ...job, status: 'planned', savedAt: new Date().toISOString() }],
    );
  }, []);
  const setSavedStatus = useCallback((id, status) => {
    if (!STAGE_BY_KEY[status]) return;
    setSaved((prev) => prev.map((j) => (j.id === id ? { ...j, status, statusAt: new Date().toISOString() } : j)));
  }, []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const addInstitutions = useCallback((list) => {
    if (registerInstitutions(list)) setInstitutionsVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      picks, toggle, isPicked, clear, setPicks,
      hireTypes, toggleHireType, career, setCareer,
      saved, isSaved, toggleSaved, setSavedStatus,
      theme, toggleTheme,
      institutionsVersion, addInstitutions,
    }),
    [picks, toggle, isPicked, clear, hireTypes, toggleHireType, career, saved, isSaved, toggleSaved, setSavedStatus, theme, toggleTheme, institutionsVersion, addInstitutions],
  );
  return <PickContext.Provider value={value}>{children}</PickContext.Provider>;
}

export function usePicks() {
  const ctx = useContext(PickContext);
  if (!ctx) throw new Error('usePicks는 PickProvider 안에서만 쓸 수 있어요');
  return ctx;
}
