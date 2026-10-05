// 대시보드 상단 탭: [My 픽 전체] [한전] [인국공] ... 중 하나를 골라 데이터를 거릅니다.
import { Link } from 'react-router-dom';
import { COMPANY_BY_ID } from '../data/companies.js';

export default function PickFilterBar({ picks, active, onChange }) {
  const tab = (id, label) => {
    const on = active === id;
    return (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={on}
        onClick={() => onChange(id)}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          on ? 'bg-brand-500 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-400'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div role="tablist" className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4">
      {tab('all', `My 픽 전체 ${picks.length}`)}
      {picks.map((id) => {
        const c = COMPANY_BY_ID[id];
        return tab(id, `${c.emoji} ${c.short}`);
      })}
      <Link
        to="/pick"
        className="shrink-0 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:border-slate-500 hover:text-slate-700"
      >
        + 편집
      </Link>
    </div>
  );
}
