// 네이버 검색 API (https://developers.naver.com/docs/serviceapi/search/blog/blog.md)
// 하루 25,000회 무료. 키는 서버 환경변수에만 두고 브라우저로 보내지 않습니다.

export function hasNaverKey() {
  return Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
}

/** type: 'blog' | 'news' */
export async function naverSearch(type, query, { display = 10, sort = 'sim' } = {}) {
  const url = `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}`;
  const r = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
    },
  });
  if (!r.ok) throw new Error(`네이버 ${type} 검색 실패 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  return data.items ?? [];
}
