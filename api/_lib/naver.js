// 네이버 검색 API — NAVER API HUB(네이버 클라우드 콘솔에서 발급)
// 문서: https://api.ncloud-docs.com/docs/naver-api-hub-search-blog
// 블로그·뉴스 각각 하루 25,000회 무료. 키는 서버 환경변수에만 두고 브라우저로 보내지 않습니다.

const BASE = 'https://naverapihub.apigw.ntruss.com/search/v1';

export function hasNaverKey() {
  return Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
}

/** type: 'blog' | 'news' */
export async function naverSearch(type, query, { display = 10, sort = 'sim', start = 1 } = {}) {
  const url = `${BASE}/${type}?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}&format=json`;
  const r = await fetch(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
      'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET,
    },
  });
  if (!r.ok) throw new Error(`네이버 ${type} 검색 실패 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  return data.items ?? [];
}
