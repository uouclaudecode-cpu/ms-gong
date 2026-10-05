import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { PickProvider } from './context/PickContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PickProvider>
        <App />
      </PickProvider>
    </BrowserRouter>
    {/* 방문자 통계: Vercel 프로젝트에서 Analytics를 켜야 수집됩니다. 개인정보·쿠키를 쓰지 않아요 */}
    <Analytics />
  </StrictMode>,
);

// 홈 화면 설치용 서비스워커 (배포된 사이트에서만)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
