// 선택한 기업 관련 뉴스 (최근 6개월) + 기간·주제 필터
import { useState } from 'react';
import { COMPANY_BY_ID } from '../data/companies.js';
import DataStatus from './DataStatus.jsx';

const TOPICS = ['전체', '이슈', '경영평가', '정책', '채용'];
const PERIODS = [
  { key: 'week', label: '1주', days: 7 },
  { key: 'month', label: '1개월', days: 31 },
  { key: 'quarter', label: '3개월', days: 92 },
  { key: 'half', label: '6개월', days: 183 },
];
const TOPIC_COLOR = {
  이슈: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  경영평가: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  정책: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
  채용: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
};
const PAGE = 8;

/** 일주일 안이면 'n시간 전', 그보다 오래되면 '5월 7일' */
function when(date) {
  const mins = Math.round((Date.now() - Date.parse(date)) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}분 전`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}시간 전`;
  const days = Math.round(mins / 1440);
  if (days <= 7) return days === 1 ? '어제' : `${days}일 전`;
  const d = new Date(Date.parse(date) + 9 * 3600000);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}

export default function NewsList({ result, companyIds, limit = PAGE }) {
  const [topic, setTopic] = useState('전체');
  const [period, setPeriod] = useState('half');
  const [shown, setShown] = useState(limit);

  const days = PERIODS.find((p) => p.key === period).days;
  const since = Date.now() - days * 86400000;
  const filtered = (result?.items ?? []).filter(
    (n) =>
      companyIds.includes(n.companyId) &&
      Date.parse(n.publishedAt) >= since &&
      (topic === '전체' || n.topic === topic),
  );
  const list = filtered.slice(0, shown);
  const pick = (setter) => (v) => {
    setter(v);
    setShown(limit); // 필터를 바꾸면 처음 개수로
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="section-title">📰 뉴스</h2>
        <DataStatus result={result} source="네이버 뉴스" />
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70" role="tablist" aria-label="기간">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={period === p.key}
            onClick={() => pick(setPeriod)(p.key)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              period === p.key
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map((t) => (
          <button key={t} type="button" onClick={() => pick(setTopic)(t)} className={`chip !px-2.5 !py-1 text-xs ${topic === t ? 'chip-on' : ''}`}>
            {t}
          </button>
        ))}
        <span className="muted ml-auto self-center text-xs">{filtered.length}건</span>
      </div>

      <ul className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
        {list.length === 0 && <li className="muted py-8 text-center text-sm">이 기간·주제의 뉴스가 없어요.</li>}
        {list.map((n) => (
          <li key={n.id}>
            <a href={n.url} target="_blank" rel="noreferrer" className="block p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="mb-1 flex items-center gap-1.5 text-xs">
                <span className={`rounded px-1.5 py-0.5 font-semibold ${TOPIC_COLOR[n.topic]}`}>{n.topic}</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{COMPANY_BY_ID[n.companyId].short}</span>
                <span className="ml-auto shrink-0 text-slate-400">{when(n.publishedAt)}</span>
              </div>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">{n.title}</p>
              {n.description && <p className="muted mt-1 line-clamp-2 text-xs">{n.description}</p>}
              {n.press && <p className="mt-1 text-[11px] text-slate-400">{n.press}</p>}
            </a>
          </li>
        ))}
      </ul>

      {filtered.length > shown && (
        <button type="button" onClick={() => setShown((s) => s + PAGE * 2)} className="btn-ghost w-full">
          뉴스 더 보기 ({filtered.length - shown}개 남음)
        </button>
      )}
    </section>
  );
}
