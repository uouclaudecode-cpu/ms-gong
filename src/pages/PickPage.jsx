import { Link } from 'react-router-dom';
import CompanyPicker from '../components/CompanyPicker.jsx';
import { usePicks } from '../context/PickContext.jsx';

export default function PickPage() {
  const { picks } = usePicks();

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My 픽 공기업</h1>
          <p className="mt-1 text-sm text-slate-500">관심 있는 기업을 눌러 고르세요. 고른 기업의 정보만 대시보드에 보여요.</p>
        </div>
        <Link
          to="/"
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            picks.length ? 'bg-brand-500 text-white hover:bg-brand-600' : 'pointer-events-none bg-slate-200 text-slate-400'
          }`}
        >
          완료
        </Link>
      </div>
      <CompanyPicker />
    </div>
  );
}
