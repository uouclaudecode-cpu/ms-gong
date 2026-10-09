// 홈 상단 탭: [My 픽 전체] [한전] [인국공] ... 중 하나를 골라 데이터를 거릅니다.
import { Link } from 'react-router-dom';
import { getCompany } from '../data/registry.js';

export default function PickFilterBar({ picks, active, onChange }) {
  const tab = (id, label) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={active === id}
      onClick={() => onChange(id)}
      className={`chip ${active === id ? 'chip-brand' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div role="tablist" className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4">
      {tab('all', `전체 ${picks.length}`)}
      {picks.map((id) => {
        const c = getCompany(id);
        return tab(id, `${c.emoji} ${c.short}`);
      })}
      <Link to="/pick" className="chip border border-dashed border-slate-300 !ring-0 dark:border-slate-600">
        + 편집
      </Link>
    </div>
  );
}
