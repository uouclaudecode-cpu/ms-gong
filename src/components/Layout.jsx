import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';
import Logo from './Logo.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// 화면 상단(PC)과 하단 탭바(모바일)에 같은 메뉴를 씁니다
const NAV = [
  { to: '/', label: '홈', icon: '🏠', end: true },
  { to: '/calendar', label: '캘린더', icon: '📅' },
  { to: '/saved', label: '찜', icon: '⭐', badge: 'saved' },
  { to: '/pick', label: 'My 픽', icon: '✅', badge: 'picks' },
];

function ThemeToggle() {
  const { theme, toggleTheme } = usePicks();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '라이트 모드로' : '다크 모드로'}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

function Badge({ n }) {
  if (!n) return null;
  return (
    <span className="ml-1 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{n}</span>
  );
}

export default function Layout() {
  const { picks, saved } = usePicks();
  const { pathname } = useLocation();
  const counts = { picks: picks.length, saved: saved.length };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <Link to="/" aria-label="MS PICK 홈">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {n.label}
                  <Badge n={n.badge && counts[n.badge]} />
                </NavLink>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:pb-12">
        <ErrorBoundary resetKey={pathname} name="이 페이지">
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="hidden border-t border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500 sm:block">
        <p className="font-semibold text-slate-700 dark:text-slate-300">MS PICK · My Selection PICK</p>
        <p className="mt-1">채용 공고: 잡알리오(공공데이터포털) · 뉴스·블로그: 네이버 검색 API</p>
        <p className="mt-1">지원 전에 반드시 기관 원문 공고를 확인하세요.</p>
      </footer>

      {/* 모바일 하단 탭바 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90 sm:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                    isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
                  }`
                }
              >
                <span className="text-xl leading-none">{n.icon}</span>
                {n.label}
                {n.badge && counts[n.badge] > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-1 rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                    {counts[n.badge]}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
