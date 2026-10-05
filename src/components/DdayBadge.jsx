import { getDday } from '../lib/dday.js';

const TONE = {
  urgent: 'bg-rose-500 text-white',
  soon: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  normal: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  always: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  closed: 'bg-slate-200 text-slate-500 line-through dark:bg-slate-800',
};

export default function DdayBadge({ deadline }) {
  const { label, tone } = getDday(deadline);
  return <span className={`rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ${TONE[tone]}`}>{label}</span>;
}
