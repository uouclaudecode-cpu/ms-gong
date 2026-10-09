// GET /api/jobs → 잡알리오의 진행 중 채용 공고 전체 (모든 공공기관)
// 공공데이터포털 '재정경제부_공공기관 채용정보 조회서비스' (data.go.kr/data/15125273)
// 미리 불러 둔 파일(3시간 이내)이 있으면 그걸, 없으면 잡알리오에서 직접 만듭니다.
import { buildJobs } from './_lib/builders.js';
import { HOUR, snapshotOr } from './_lib/snapshot.js';
import { cache, fail, hasAlioKey, noKey } from './_lib/util.js';

// 외부 API를 여러 번 부를 수 있으므로 넉넉히 (Vercel 기본 제한보다 길게)
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!hasAlioKey()) return noKey(res, 'DATA_GO_KR_KEY');
  try {
    const data = await snapshotOr('jobs', 3 * HOUR, buildJobs);
    cache(res, 1800); // 30분 (스냅숏이 매시간 새로 올라옵니다)
    res.status(200).json(data);
  } catch (err) {
    fail(res, err);
  }
}
