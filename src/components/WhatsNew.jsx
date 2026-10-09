// 홈 맨 위 '지난 방문 이후' 요약: 내 픽 기업 새 공고 · 아직 지원 안 한 찜 공고 마감 임박 · 다가오는 전형 일정
import { Link } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';
import { getCompany } from '../data/registry.js';
import { schedulesOf, stageOf } from '../lib/apply.js';
import { getDday } from '../lib/dday.js';

function Item({ to, onClick, icon, children, tone = '' }) {
  const cls = `flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/60 dark:hover:bg-slate-800/60 ${tone}`;
  const body = (
    <>
      <span className="text-base">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span className="text-slate-400">›</span>
    </>
  );
  return (
    <li>
      {to ? (
        <Link to={to} className={cls}>
          {body}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cls}>
          {body}
        </button>
      )}
    </li>
  );
}

export default function WhatsNew({ jobs, newIds, prevAt, onShowNew }) {
  const { picks, saved, passesFilters } = usePicks();

  const fresh = jobs.filter((j) => newIds.has(j.id) && picks.includes(j.companyId) && passesFilters(j));
  // 찜했는데 아직 '지원 예정'이고 3일 안에 마감
  const closing = saved.filter((j) => stageOf(j).key === 'planned' && ['urgent'].includes(getDday(j.deadline).tone));
  // 7일 안의 전형 일정
  const upcoming = schedulesOf(saved).filter(({ date }) => {
    const d = getDday(date).days;
    return d !== null && d >= 0 && d <= 7;
  });

  if (!fresh.length && !closing.length && !upcoming.length) return null;

  const since = prevAt ? new Date(prevAt) : null;
  const sinceLabel = since ? `${since.getMonth() + 1}월 ${since.getDate()}일 방문 이후` : '';

  return (
    <section className="rounded-2xl bg-gradient-to-br from-brand-50 to-pick-400/10 p-3 ring-1 ring-brand-100 dark:from-brand-900/30 dark:to-pick-500/10 dark:ring-brand-900">
      <p className="px-3 pb-1 pt-1 text-xs font-bold text-brand-700 dark:text-brand-200">🔔 확인할 것 {sinceLabel && `· ${sinceLabel}`}</p>
      <ul>
        {fresh.length > 0 && (
          <Item onClick={onShowNew} icon="🆕">
            내 픽 기업 새 공고 <b>{fresh.length}건</b>
            <span className="muted"> · {[...new Set(fresh.map((j) => getCompany(j.companyId)?.short))].slice(0, 3).join(', ')}</span>
          </Item>
        )}
        {closing.map((j) => (
          <Item key={j.id} to="/saved" icon="⏰" tone="text-rose-700 dark:text-rose-300">
            찜한 공고 <b>{getDday(j.deadline).label}</b> 마감, 아직 지원 전 · {j.title}
          </Item>
        ))}
        {upcoming.slice(0, 3).map(({ job, kind, date }) => (
          <Item key={`${job.id}-${kind.key}`} to="/saved" icon={kind.icon}>
            <b>{getDday(date).label}</b> {getCompany(job.companyId)?.short} {kind.label}
            <span className="muted"> · {job.title}</span>
          </Item>
        ))}
      </ul>
    </section>
  );
}
