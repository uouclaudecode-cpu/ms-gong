// 지원 현황 단계와 '새 공고' 판별
import { addDays, todayKST } from './dday.js';

// 찜한 공고의 지원 단계. 순서대로 진행되고, 불합격은 어느 단계에서든 고를 수 있습니다.
export const STAGES = [
  { key: 'planned', label: '지원 예정', icon: '📝', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { key: 'applied', label: '지원 완료', icon: '📮', color: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  { key: 'docs', label: '서류 합격', icon: '📄', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' },
  { key: 'written', label: '필기 합격', icon: '✍️', color: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' },
  { key: 'final', label: '최종 합격', icon: '🎉', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { key: 'rejected', label: '불합격', icon: '🌧️', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
];
export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));
export const stageOf = (job) => STAGE_BY_KEY[job.status] ?? STAGES[0];

// 찜한 공고에 적어 두는 전형 일정 (공고 객체에 같은 키로 'YYYY-MM-DD' 저장)
export const SCHEDULE_KINDS = [
  { key: 'docsResult', label: '서류 발표', icon: '📄' },
  { key: 'written', label: '필기', icon: '✍️' },
  { key: 'interview', label: '면접', icon: '🎤' },
  { key: 'finalResult', label: '최종 발표', icon: '🎉' },
];

/** 찜한 공고들의 일정 → [{ job, kind, date }] 날짜순 */
export function schedulesOf(savedJobs) {
  return savedJobs
    .flatMap((job) => SCHEDULE_KINDS.filter((k) => job[k.key]).map((kind) => ({ job, kind, date: job[kind.key] })))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** 어제·오늘 시작한 공고 = 새 공고 */
export function isNewJob(job, today = todayKST()) {
  return Boolean(job.startsAt) && job.startsAt >= addDays(-1, today) && job.startsAt <= today;
}

// 신입·경력 필터: 잡알리오 채용구분(신입 / 경력 / 신입+경력)
export const CAREERS = [
  { key: 'new', label: '신입 가능', test: (j) => !j.career || j.career.includes('신입') },
  { key: 'exp', label: '경력', test: (j) => !j.career || j.career.includes('경력') },
  { key: 'all', label: '전체', test: () => true },
];
