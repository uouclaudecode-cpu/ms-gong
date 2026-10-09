// 미리 불러 둔 데이터(스냅숏) 읽기.
// GitHub Actions(.github/workflows/snapshot.yml)가 정해진 시간마다 잡알리오 데이터를 만들어
// 이 저장소의 `data` 브랜치에 JSON으로 올려 둡니다. 서버 함수는 먼저 그 파일을 읽고(1초 안),
// 없거나 너무 오래됐을 때만 잡알리오를 직접 부릅니다(10~30초).
const BASE = process.env.SNAPSHOT_BASE ?? 'https://raw.githubusercontent.com/uouclaudecode-cpu/ms-gong/data';

/** name 예: 'jobs', 'institutions', 'trend/kepco'. maxAgeMs보다 오래됐거나 못 읽으면 null */
export async function readSnapshot(name, maxAgeMs) {
  try {
    const r = await fetch(`${BASE}/${name}.json`, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    const snap = await r.json();
    if (!snap?.generatedAt || Date.now() - Date.parse(snap.generatedAt) > maxAgeMs) return null;
    return snap;
  } catch {
    return null;
  }
}

/** 스냅숏이 있으면 그걸, 없으면 build()로 직접 만듭니다 */
export async function snapshotOr(name, maxAgeMs, build) {
  const snap = await readSnapshot(name, maxAgeMs);
  if (snap) return { ...snap.data, generatedAt: snap.generatedAt, from: 'snapshot' };
  return { ...(await build()), generatedAt: new Date().toISOString(), from: 'live' };
}

export const HOUR = 3600000;
