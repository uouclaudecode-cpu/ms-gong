// GET /api/trend?id=kepco → 그 기관의 최근 3년 채용 공고 흐름 (잡알리오, 마감된 공고 포함)
// 우리 목록 기업은 하루 한 번 미리 불러 둔 파일을, 그 밖의 기관은 잡알리오에서 직접 만듭니다.
import { buildTrend } from './_lib/builders.js';
import { HOUR, readSnapshot, snapshotOr } from './_lib/snapshot.js';
import { cache, fail, hasAlioKey, noKey, resolveCompany } from './_lib/util.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!hasAlioKey()) return noKey(res, 'DATA_GO_KR_KEY');

  try {
    const company = await resolveCompany(req.query.id);
    if (!company) return res.status(400).json({ error: 'bad_company' });

    // companies.js에 기관코드가 없으면, 진행 중 공고에서 알아낸 코드를 씁니다
    const code = company.code ?? (await readSnapshot('jobs', 48 * HOUR))?.data?.codes?.[company.id];
    if (!code) {
      cache(res, 6 * 3600);
      return res.status(200).json({ available: false });
    }

    const data = await snapshotOr(`trend/${company.id}`, 72 * HOUR, () => buildTrend(code));
    cache(res, 86400); // 하루
    res.status(200).json(data);
  } catch (err) {
    fail(res, err);
  }
}
