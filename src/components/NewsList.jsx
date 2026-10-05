// 선택한 기업 관련 뉴스 목록 + 주제(이슈·경영평가·정책·채용) 필터
import { useState } from 'react';
import { COMPANY_BY_ID } from '../data/companies.js';
import DataStatus from './DataStatus.jsx';

const TOPICS = ['전체', '이슈', '경영평가', '정책', '채용'];
const TOPIC_COLOR = {
  이슈: 'bg-sky-100 text-sky-800',
  경영평가: 'bg-violet-100 text-violet-800',
  정책: 'bg-teal-100 text-teal-800',
  채용: 'bg-orange-100 text-orange-800',
};

function timeAgo(date) {
  const mins = Math.round((Date.now() - Date.parse(date)) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}분 전`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}시간 전`;
  const days = Math.round(mins / 1440);
  return days === 1 ? '어제' : `${days}일 전`;
}

export default function NewsList({ result, companyIds, limit }) {
  const [topic, setTopic] = useState('전체');
  const news = (result?.items ?? []).filter((n) => companyIds.includes(n.companyId));
  const filtered = news.filter((n) => topic === '전체' || n.topic === topic);
  const list = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold">📰 뉴스 큐레이션</h2>
        <DataStatus result={result} source="네이버 뉴스" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              topic === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {list.length === 0 && <li className="py-8 text-center text-sm text-slate-500">해당 주제의 뉴스가 없어요.</li>}
        {list.map((n) => (
          <li key={n.id}>
            <a href={n.url} target="_blank" rel="noreferrer" className="block p-3.5 transition hover:bg-slate-50">
              <div className="mb-1 flex items-center gap-1.5 text-xs">
                <span className={`rounded px-1.5 py-0.5 font-medium ${TOPIC_COLOR[n.topic]}`}>{n.topic}</span>
                <span className="font-medium text-slate-600">{COMPANY_BY_ID[n.companyId].short}</span>
                <span className="ml-auto shrink-0 text-slate-400">{timeAgo(n.publishedAt)}</span>
              </div>
              <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">{n.title}</p>
              {n.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{n.description}</p>}
              {n.press && <p className="mt-1 text-[11px] text-slate-400">{n.press}</p>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
