import { useState } from 'react';
import { Link } from 'react-router-dom';
import CompanyPicker from '../components/CompanyPicker.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { sharePicksUrl } from '../lib/links.js';

function ShareButton({ picks }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = sharePicksUrl(picks);
    try {
      // 휴대폰이면 공유 창(카톡 등), 아니면 주소 복사
      if (navigator.share) await navigator.share({ title: 'MS PICK · 내 공기업 픽', url });
      else await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // 공유 창을 닫은 경우 등은 조용히 넘어갑니다
    }
  };
  return (
    <button type="button" onClick={share} disabled={!picks.length} className="btn-ghost disabled:opacity-40">
      {done ? '✓ 링크 복사됨' : '🔗 내 픽 공유'}
    </button>
  );
}

export default function PickPage() {
  const { picks } = usePicks();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">My 픽 공기업</h1>
          <p className="muted mt-1 text-sm">관심 있는 기업을 눌러 PICK 하세요. 고른 기업의 정보만 홈에 보여요.</p>
        </div>
        <div className="flex gap-2">
          <ShareButton picks={picks} />
          <Link to="/" className={`btn-primary ${picks.length ? '' : 'pointer-events-none opacity-40'}`}>
            완료
          </Link>
        </div>
      </div>
      <CompanyPicker />
    </div>
  );
}
