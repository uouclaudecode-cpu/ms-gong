import { getDday } from '../lib/dday.js';

const TONE = {
  urgent: 'bg-rose-500 text-white',
  soon: 'bg-amber-100 text-amber-800',
  normal: 'bg-slate-100 text-slate-700',
  always: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-200 text-slate-500 line-through',
};

export default function DdayBadge({ deadline }) {
  const { label, tone } = getDday(deadline);
  return <span className={`rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${TONE[tone]}`}>{label}</span>;
}
