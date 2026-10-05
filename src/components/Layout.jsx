import { Link, NavLink, Outlet } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Layout() {
  const { picks } = usePicks();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="text-xl">🏛️</span>
            <span>공기업 패스</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              대시보드
            </NavLink>
            <NavLink to="/pick" className={navClass}>
              My 픽
              {picks.length > 0 && (
                <span className="ml-1.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-xs text-white">{picks.length}</span>
              )}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>채용 공고: 잡알리오(공공데이터포털) · 뉴스·블로그: 네이버 검색 API</p>
        <p className="mt-1">지원 전에 반드시 기관 원문 공고를 확인하세요.</p>
      </footer>
    </div>
  );
}
