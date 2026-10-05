// "홈 화면에 MS PICK 추가" 안내 카드.
// 안드로이드·PC 크롬: 설치 버튼 한 번. 아이폰 사파리: 공유 → 홈 화면에 추가 방법 안내.
// 이미 앱으로 열었거나 "다음에"를 누르면 보이지 않습니다.
import { useEffect, useState } from 'react';
import { LogoMark } from './Logo.jsx';

const DISMISS_KEY = 'ms-gong:install-dismissed';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null); // 크롬이 준 설치 이벤트
  const [hidden, setHidden] = useState(() => isStandalone() || wasDismissed());
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault(); // 크롬 기본 배너 대신 우리 카드에서 설치
      setPrompt(e);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // 설치할 방법이 없는 브라우저(예: 데스크톱 사파리)에서는 보이지 않습니다
  if (hidden || (!prompt && !isIOS())) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 저장 못 해도 이번엔 숨깁니다
    }
    setHidden(true);
  };

  const install = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setHidden(true);
      setPrompt(null);
    } else {
      setShowIosHelp((v) => !v);
    }
  };

  return (
    <aside className="card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <LogoMark className="h-12 w-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">홈 화면에 MS PICK 추가</p>
          <p className="muted text-sm">앱처럼 바로 열 수 있어요. 설치비·용량 걱정 없어요.</p>
        </div>
      </div>
      {showIosHelp && (
        <ol className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          <li>
            1. 사파리 아래쪽 <b>공유 버튼</b>(□↑)을 누르고
          </li>
          <li>
            2. <b>홈 화면에 추가</b>를 고른 뒤
          </li>
          <li>
            3. 오른쪽 위 <b>추가</b>를 누르면 끝!
          </li>
        </ol>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={dismiss} className="btn-ghost flex-1">
          다음에
        </button>
        <button type="button" onClick={install} className="btn-primary flex-1">
          {prompt ? '📲 설치하기' : showIosHelp ? '닫기' : '📲 추가 방법 보기'}
        </button>
      </div>
    </aside>
  );
}
