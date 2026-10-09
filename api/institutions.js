// GET /api/institutions → 잡알리오에 최근 공고를 낸 공공기관 목록 (우리 목록 밖의 기관만)
// "전체 공공기관에서 찾기"에 씁니다. 미리 불러 둔 파일(2일 이내)이 있으면 그걸 씁니다.
import { buildInstitutions } from './_lib/builders.js';
import { HOUR, snapshotOr } from './_lib/snapshot.js';
import { cache, fail, hasAlioKey, noKey } from './_lib/util.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!hasAlioKey()) return noKey(res, 'DATA_GO_KR_KEY');
  try {
    const data = await snapshotOr('institutions', 48 * HOUR, buildInstitutions);
    cache(res, 6 * 3600);
    res.status(200).json(data);
  } catch (err) {
    fail(res, err);
  }
}
